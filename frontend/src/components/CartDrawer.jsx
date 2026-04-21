import { useState } from 'react';
import { Drawer, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import {
  closeDrawer,
  updateCartItem,
  removeFromCart,
  applyPromo,
  clearCart,
} from '../features/cart/cartSlice.js';
import { formatPrice } from '../utils/validators.js';


const CartDrawer = () => {
  const dispatch = useDispatch();
  const open = useSelector((s) => s.cart.drawerOpen);
  const { items, subtotal, tax, discount, total, discountCode, error } =
    useSelector((s) => s.cart);

  const [promo, setPromo] = useState(discountCode || '');

  const onChangeQty = (product, quantity) => {
    const q = Math.max(0, Number(quantity) || 0);
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
    dispatch(clearCart());
    dispatch(closeDrawer());
    message.success('Thanks! Your order has been placed.');
  };


  const drawerWidth =
    typeof window !== 'undefined' && window.innerWidth < 640 ? '100%' : 420;

  return (
    <Drawer
      placement="right"
      open={open}
      onClose={() => dispatch(closeDrawer())}
      width={drawerWidth}
      closable={false}
      styles={{
        body: { padding: 0, background: '#fff' },
        header: { display: 'none' },
      }}
    >
 
      <div className="flex items-center justify-between bg-brand-500 px-5 py-4 text-white">
        <h2 className="text-lg font-semibold">
          Cart{' '}
          <span className="text-base font-normal opacity-90">
            ({items.length})
          </span>
        </h2>
        <button
          type="button"
          onClick={() => dispatch(closeDrawer())}
          className="flex h-8 w-8 items-center justify-center rounded-md text-xl text-white hover:bg-white/10"
          aria-label="Close"
        >
          ×
        </button>
      </div>

    
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-10 text-center">
          <div className="mb-2 text-5xl">🛒</div>
          <p className="text-sm text-gray-500">Your cart is empty</p>
        </div>
      ) : (
        <div className="flex h-[calc(100%-68px)] flex-col">
     
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {items.map((it) => {
              const p = it.product || {};
              return (
                <div
                  key={p._id}
                  className="flex gap-3 border-b border-gray-100 py-3 last:border-b-0"
                >
                
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-gray-50">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="h-full w-full object-contain"
                      />
                    ) : null}
                  </div>

               
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className="truncate text-sm font-medium text-gray-900"
                        title={p.name}
                      >
                        {p.name}
                      </span>
                      <span className="shrink-0 text-sm font-semibold text-brand-600">
                        {formatPrice((p.price || 0) * it.quantity)}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                    
                      <div className="inline-flex items-center rounded-md border border-gray-200">
                        <button
                          type="button"
                          onClick={() => onChangeQty(p, it.quantity - 1)}
                          className="flex h-8 w-8 items-center justify-center text-gray-700 hover:bg-gray-50"
                          aria-label="Decrease"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={it.quantity}
                          onChange={(e) => onChangeQty(p, e.target.value)}
                          className="h-8 w-10 border-x border-gray-200 text-center text-sm focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => onChangeQty(p, it.quantity + 1)}
                          className="flex h-8 w-8 items-center justify-center text-gray-700 hover:bg-gray-50"
                          aria-label="Increase"
                        >
                          +
                        </button>
                      </div>

                     
                      <button
                        type="button"
                        onClick={() =>
                          dispatch(removeFromCart({ product: p }))
                        }
                        className="text-sm text-gray-500 underline-offset-2 hover:text-brand-500 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

        
            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Apply Discount Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="20 DOLLAR OFF"
                  value={promo}
                  onChange={(e) => setPromo(e.target.value)}
                  className="block h-10 flex-1 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
                <button
                  type="button"
                  onClick={onApplyPromo}
                  className="inline-flex h-10 shrink-0 items-center justify-center rounded-md bg-brand-500 px-5 text-sm font-medium text-white shadow-sm hover:bg-brand-600"
                >
                  Apply
                </button>
              </div>
              {error ? (
                <p className="mt-2 text-xs text-red-600">{error}</p>
              ) : null}
            </div>
          </div>

    
          <div className="border-t border-gray-200 bg-white px-5 py-4">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">Subtotal</dt>
                <dd className="font-medium text-gray-900">
                  {formatPrice(subtotal)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Tax</dt>
                <dd className="font-medium text-gray-900">
                  {formatPrice(tax)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Discount</dt>
                <dd className="font-medium text-gray-900">
                  −{formatPrice(discount)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-2 text-base">
                <dt className="font-semibold text-gray-900">
                  Estimated total
                </dt>
                <dd className="font-semibold text-gray-900">
                  {formatPrice(total)}
                </dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={onCheckout}
              className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            >
              Continue to checkout
            </button>
          </div>
        </div>
      )}
    </Drawer>
  );
};

export default CartDrawer;
