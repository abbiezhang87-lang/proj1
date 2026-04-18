import { Drawer, Button, InputNumber, Input, Space, Empty, message } from 'antd';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  closeDrawer,
  updateCartItem,
  removeFromCart,
  applyPromo,
  clearCart,
} from '../features/cart/cartSlice.js';
import { formatPrice } from '../utils/validators.js';
import './CartDrawer.css';

/**
 * Cart drawer — matches the Figma checkout mock: items with qty controls,
 * promo code, subtotal/tax/discount/estimated total, Continue button.
 *
 * Covers Phase III #3a-e:
 *   a. edit product on cart → qty InputNumber + remove
 *   b. promo code validation (server-side)
 *   c. consistent with product pages (updates flow through same slice)
 *   d. logged-in users see their server-persisted cart; guests see localStorage
 *   e. responsive (Drawer collapses to full-width on mobile)
 */
const CartDrawer = () => {
  const dispatch = useDispatch();
  const open = useSelector((s) => s.cart.drawerOpen);
  const { items, subtotal, tax, discount, total, discountCode, error } =
    useSelector((s) => s.cart);
  const [promo, setPromo] = useState(discountCode || '');

  const onChangeQty = (product, quantity) => {
    const q = Number(quantity) || 0;
    dispatch(updateCartItem({ product, quantity: q }));
  };

  const onApplyPromo = async () => {
    const res = await dispatch(applyPromo(promo));
    if (res.meta.requestStatus === 'fulfilled') {
      message.success('Promo applied');
    } else {
      message.error(res.payload || 'Invalid promotion code');
    }
  };

  const onCheckout = () => {
    if (!items.length) {
      message.warning('Your cart is empty');
      return;
    }
    // Demo: checkout just clears the cart
    dispatch(clearCart());
    dispatch(closeDrawer());
    message.success('Thanks! Your order has been placed.');
  };

  return (
    <Drawer
      title={
        <div className="cart-drawer-title">
          Cart <span className="count">({items.length})</span>
        </div>
      }
      placement="right"
      open={open}
      onClose={() => dispatch(closeDrawer())}
      width={420}
      styles={{ header: { background: '#5e5adb', color: '#fff' } }}
      closeIcon={<span style={{ color: '#fff', fontSize: 18 }}>×</span>}
    >
      {items.length === 0 ? (
        <Empty description="Your cart is empty" />
      ) : (
        <>
          <div className="cart-items">
            {items.map((it) => (
              <div className="cart-item" key={it.product?._id}>
                <img src={it.product?.imageUrl} alt={it.product?.name} />
                <div className="cart-item-info">
                  <div className="cart-item-head">
                    <span className="name">{it.product?.name}</span>
                    <span className="price">
                      {formatPrice((it.product?.price || 0) * it.quantity)}
                    </span>
                  </div>
                  <Space.Compact>
                    <Button onClick={() => onChangeQty(it.product, it.quantity - 1)}>-</Button>
                    <InputNumber
                      min={0}
                      value={it.quantity}
                      controls={false}
                      onChange={(v) => onChangeQty(it.product, v || 0)}
                      style={{ width: 60, textAlign: 'center' }}
                    />
                    <Button onClick={() => onChangeQty(it.product, it.quantity + 1)}>+</Button>
                  </Space.Compact>
                  <a
                    className="remove-link"
                    onClick={() => dispatch(removeFromCart({ product: it.product }))}
                  >
                    Remove
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="promo">
            <label>Apply Discount Code</label>
            <Space.Compact block>
              <Input
                placeholder="20 DOLLAR OFF"
                value={promo}
                onChange={(e) => setPromo(e.target.value)}
              />
              <Button
                type="primary"
                onClick={onApplyPromo}
                style={{ background: '#5e5adb', borderColor: '#5e5adb' }}
              >
                Apply
              </Button>
            </Space.Compact>
            {error ? (
              <div className="promo-error">{error}</div>
            ) : null}
          </div>

          <div className="totals">
            <div>
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div>
              <span>Tax</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <div>
              <span>Discount</span>
              <span>-{formatPrice(discount)}</span>
            </div>
            <div className="total-row">
              <span>Estimated total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <Button
            type="primary"
            block
            size="large"
            onClick={onCheckout}
            style={{
              background: '#5e5adb',
              borderColor: '#5e5adb',
              marginTop: 16,
            }}
          >
            Continue to checkout
          </Button>
        </>
      )}
    </Drawer>
  );
};

export default CartDrawer;
