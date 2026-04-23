import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  addToCart,
  updateCartItem,
  selectCartQuantityFor,
} from '../features/cart/cartSlice.js';
import { formatPrice } from '../utils/validators.js';

/**
 * 商品卡片组件
 * ------------------------------------------------------------------
 * 功能说明：
 *   - 点击卡片空白处 → 跳转到商品详情页
 *   - 右下角按钮：
 *     · 普通用户：一个 Add 按钮（或 [− 数量 +]）
 *     · 管理员：  Add 按钮 + Edit 按钮并排显示
 *   - 缺货商品：
 *     · 按钮保持可点击状态（不变灰）
 *     · 点了不会加入购物车（静默忽略）
 *     · 价格旁边显示红色 "Out of Stock" 标签
 */
const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAdmin } = useSelector((s) => s.auth);
  const quantity = useSelector(selectCartQuantityFor(product._id));

  // 库存信息
  const stock = product.inStockQuantity ?? 0;
  const outOfStock = stock <= 0;

  // 点击 Add 按钮
  const handleAdd = (e) => {
    e.stopPropagation(); // 阻止冒泡，否则会顺带触发卡片跳详情
    if (outOfStock) return;
    dispatch(addToCart({ product, quantity: 1 }));
  };

  // 改购物车数量（+ 或 - 按钮）
  const handleChangeQty = (e, newQty) => {
    e.stopPropagation();
    if (newQty < 0 || newQty > stock) return; // 越界忽略
    dispatch(updateCartItem({ product, quantity: newQty }));
  };

  // 点击 Edit 按钮
  const handleEdit = (e) => {
    e.stopPropagation();
    navigate(`/products/${product._id}/edit`);
  };

  return (
    <div
      onClick={() => navigate(`/products/${product._id}`)}
      className="flex cursor-pointer flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md"
    >
      {/* 图片区 */}
      <div className="aspect-square w-full bg-gray-50">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            No image
          </div>
        )}
      </div>

      {/* 信息 + 按钮 */}
      <div className="flex flex-col gap-2 p-3">
        <div className="truncate text-sm text-gray-600">{product.name}</div>

        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
          {outOfStock && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-600">
              Out of Stock
            </span>
          )}
        </div>

        {/* 按钮区 —— 管理员 2 列 / 普通用户 1 列 */}
        <div className={isAdmin ? 'grid grid-cols-2 gap-2' : ''}>
          {quantity > 0 ? (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex h-9 items-center justify-between rounded-md bg-brand-500 px-1 text-white"
            >
              <button
                type="button"
                onClick={(e) => handleChangeQty(e, quantity - 1)}
                className="h-7 w-7 rounded hover:bg-white/15"
              >
                −
              </button>
              <span className="text-sm font-medium">{quantity}</span>
              <button
                type="button"
                onClick={(e) => handleChangeQty(e, quantity + 1)}
                className="h-7 w-7 rounded hover:bg-white/15"
              >
                +
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              className="h-9 w-full rounded-md bg-brand-500 text-sm font-medium text-white hover:bg-brand-600"
            >
              Add
            </button>
          )}

          {isAdmin && (
            <button
              type="button"
              onClick={handleEdit}
              className="h-9 w-full rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
