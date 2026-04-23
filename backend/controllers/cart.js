import Cart from '../models/Cart.js';
import Product from '../models/product.js';
import { PROMO_CODES, computeAmounts } from '../utils/pricing.js';

const buildCartPayload = (cart) => {
  const items = cart.items.map((it) => ({
    product: it.product,
    quantity: it.quantity,
  }));

  const priced = items.map((it) => ({
    price: it.product?.price || 0,
    quantity: it.quantity,
  }));
  const { subtotal, tax, discount, total } = computeAmounts(
    priced,
    cart.discountCode,
  );

  return {
    items,
    discountCode: cart.discountCode || '',
    subtotal,
    tax,
    discount,
    total,
  };
};

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
    cart = await cart.populate('items.product');
  }
  return cart;
};

export const getCart = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    res.json(buildCartPayload(cart));
  } catch (err) {
    next(err);
  }
};

export const addItem = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) {
      return res.status(400).json({ message: 'productId is required' });
    }
    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const cart = await getOrCreateCart(req.user._id);
    const existing = cart.items.find(
      (it) => it.product._id.toString() === productId,
    );

    const newQty = (existing?.quantity || 0) + quantity;
    if (product.inStockQuantity <= 0) {
      return res.status(400).json({ message: 'Product is out of stock' });
    }
    if (newQty > product.inStockQuantity) {
      return res.status(400).json({
        message: `Only ${product.inStockQuantity} in stock`,
      });
    }

    if (existing) {
      existing.quantity = newQty;
    } else {
      cart.items.push({ product: productId, quantity });
    }
    await cart.save();

  const fresh = await Cart.findById(cart._id).populate('items.product');
    res.json(buildCartPayload(fresh));
  } catch (err) {
    next(err);
  }
};

export const updateItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    if (quantity == null || quantity < 0) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }

    const cart = await getOrCreateCart(req.user._id);
    const idx = cart.items.findIndex(
      (it) => it.product._id.toString() === productId,
    );
    if (idx === -1) {
      return res.status(404).json({ message: 'Item not in cart' });
    }

    if (quantity > 0) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      if (quantity > product.inStockQuantity) {
        return res.status(400).json({
          message: `Only ${product.inStockQuantity} in stock`,
        });
      }
    }

    if (quantity === 0) {
      cart.items.splice(idx, 1);
    } else {
      cart.items[idx].quantity = quantity;
    }
    await cart.save();

    const fresh = await Cart.findById(cart._id).populate('items.product');
    res.json(buildCartPayload(fresh));
  } catch (err) {
    next(err);
  }
};

export const removeItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const cart = await getOrCreateCart(req.user._id);
    cart.items = cart.items.filter(
      (it) => it.product._id.toString() !== productId,
    );
    await cart.save();

    const fresh = await Cart.findById(cart._id).populate('items.product');
    res.json(buildCartPayload(fresh));
  } catch (err) {
    next(err);
  }
};

export const applyPromo = async (req, res, next) => {
  try {
    const code = (req.body.code || '').trim().toUpperCase();
    if (!code) {
      return res.status(400).json({ message: 'Promo code is required' });
    }
    if (!PROMO_CODES[code]) {
      return res.status(400).json({ message: 'Invalid promotion code' });
    }

    const cart = await getOrCreateCart(req.user._id);
    cart.discountCode = code;
    await cart.save();

    const fresh = await Cart.findById(cart._id).populate('items.product');
    res.json(buildCartPayload(fresh));
  } catch (err) {
    next(err);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    cart.items = [];
    cart.discountCode = '';
    await cart.save();

    const fresh = await Cart.findById(cart._id).populate('items.product');
    res.json(buildCartPayload(fresh));
  } catch (err) {
    next(err);
  }
};
