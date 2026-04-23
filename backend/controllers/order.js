import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import { computeAmounts } from '../utils/pricing.js';

export const placeOrder = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      'items.product',
    );

    if (!cart || !cart.items.length) {
      return res.status(400).json({ message: 'Your cart is empty' });
    }

    const missing = cart.items.find((it) => !it.product);
    if (missing) {
      return res.status(400).json({
        message:
          'Some items in your cart are no longer available. Please refresh and try again.',
      });
    }

    const items = cart.items.map((it) => ({
      product: it.product._id,
      name: it.product.name,
      price: it.product.price,
      imageUrl: it.product.imageUrl,
      quantity: it.quantity,
    }));

    const { subtotal, tax, discount, total } = computeAmounts(
      items,
      cart.discountCode,
    );

    const order = await Order.create({
      user: req.user._id,
      items,
      subtotal,
      tax,
      discount,
      total,
      discountCode: cart.discountCode || '',
      status: 'placed',
    });

    cart.items = [];
    cart.discountCode = '';
    await cart.save();

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    res.json(orders);
  } catch (err) {
    next(err);
  }
};
