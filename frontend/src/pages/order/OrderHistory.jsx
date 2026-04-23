import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Spin, Empty, Tag } from 'antd';
import { fetchMyOrders } from '../../features/order/orderSlice.js';
import { formatPrice } from '../../utils/validators.js';

/**
 * Order History 页（额外功能）
 * ------------------------------------------------------------------
 * - 挂在 /orders，仅登录用户可访问（由 ProtectedRoute 包）
 * - 进页就 fetchMyOrders，页面打开后一直读 Redux 的 state.order.orders
 * - 每个订单展示：订单号尾号 / 下单时间 / 状态 / 商品列表 / 金额汇总
 *
 * 样式沿用项目原本的 Tailwind 设计 —— 白卡 + 圆角 + 浅灰边，
 * 跟 CartDrawer 的视觉节奏保持一致。
 */

// 订单状态对应的 antd Tag 颜色，跟 schema 里的 enum 保持一致
const STATUS_COLOR = {
  placed: 'blue',
  shipped: 'geekblue',
  delivered: 'green',
  cancelled: 'red',
};

// 把 ISO 时间戳格式化成"2026-04-21 14:32"这种好看的字符串
// 不引入 dayjs，节点级库不值得，项目里也没用到
function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export default function OrderHistory() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orders, status, error } = useSelector((s) => s.order);
  const loading = status === 'loading';

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Order History</h1>
          <p className="mt-1 text-sm text-gray-500">
            All the orders you've placed will show up here.
          </p>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <Spin />
        </div>
      )}

      {!loading && error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="rounded-xl bg-white p-10 shadow-sm ring-1 ring-black/5">
          <Empty
            description={
              <span className="text-sm text-gray-500">
                You haven&apos;t placed any orders yet.
              </span>
            }
          >
            <button
              type="button"
              onClick={() => navigate('/')}
              className="mt-2 rounded-md bg-brand-500 px-5 py-2 text-sm font-medium text-white hover:bg-brand-600"
            >
              Start shopping
            </button>
          </Empty>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <ul className="space-y-4">
          {orders.map((o) => (
            <li
              key={o._id}
              className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5"
            >
              {/* 订单头 */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-gray-50 px-5 py-3 text-sm">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
                  <div>
                    <span className="text-gray-500">Order #</span>
                    <span className="ml-1 font-mono text-gray-800">
                      {o._id.slice(-8).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Placed</span>
                    <span className="ml-1 text-gray-800">
                      {formatDate(o.createdAt)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Items</span>
                    <span className="ml-1 text-gray-800">
                      {o.items.reduce((n, it) => n + it.quantity, 0)}
                    </span>
                  </div>
                </div>
                <Tag color={STATUS_COLOR[o.status] || 'default'} className="uppercase">
                  {o.status}
                </Tag>
              </div>

              {/* 商品列表 */}
              <ul className="divide-y divide-gray-100">
                {o.items.map((it, idx) => (
                  <li
                    key={`${o._id}-${idx}`}
                    className="flex items-center gap-4 px-5 py-3"
                  >
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-gray-50">
                      {it.imageUrl && (
                        <img
                          src={it.imageUrl}
                          alt={it.name}
                          className="h-full w-full object-contain"
                        />
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p
                          className="truncate text-sm font-medium text-gray-900"
                          title={it.name}
                        >
                          {it.name}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {formatPrice(it.price)} × {it.quantity}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-gray-900">
                        {formatPrice(it.price * it.quantity)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>

              {/* 金额汇总 */}
              <dl className="space-y-1 border-t border-gray-100 bg-gray-50/60 px-5 py-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Subtotal</dt>
                  <dd>{formatPrice(o.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Tax</dt>
                  <dd>{formatPrice(o.tax)}</dd>
                </div>
                {o.discount > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-gray-600">
                      Discount{o.discountCode ? ` (${o.discountCode})` : ''}
                    </dt>
                    <dd className="text-green-600">−{formatPrice(o.discount)}</dd>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-200 pt-1 text-base">
                  <dt className="font-semibold">Total</dt>
                  <dd className="font-semibold">{formatPrice(o.total)}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
