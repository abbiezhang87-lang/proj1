import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchProductById,
  clearCurrent,
} from '../../features/product/productSlice.js';
import {
  addToCart,
  updateCartItem,
  selectCartQuantityFor,
} from '../../features/cart/cartSlice.js';
import { formatPrice } from '../../utils/validators.js';

/**
 * 商品详情页 /products/:id
 * ------------------------------------------------------------------
 * - 桌面：图片在左，信息在右（两栏）
 * - 手机：图片在上，信息在下（堆叠）
 * - Add To Cart：缺货时可点但不会加入购物车（静默忽略）
 * - Edit 按钮：仅管理员可见
 */
const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const product = useSelector((s) => s.product.current);
  const loading = useSelector((s) => s.product.status === 'loading');
  const { isAdmin } = useSelector((s) => s.auth);
  const quantity = useSelector(selectCartQuantityFor(id));

  // 进入页面拉商品数据；离开页面时清空 Redux 里的 current
  useEffect(() => {
    dispatch(fetchProductById(id));
    return () => dispatch(clearCurrent());
  }, [dispatch, id]);

  if (loading || !product) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  const stock = product.inStockQuantity ?? 0;
  const outOfStock = stock <= 0;
  // 库存不足 10 件（但还没售罄）时，在价格旁边弹个橙色小标提醒用户"手慢无"
  const lowStock = stock > 0 && stock < 10;

  const handleAdd = () => {
    if (outOfStock) return;
    dispatch(addToCart({ product, quantity: 1 }));
  };

  const handleChangeQty = (newQty) => {
    if (newQty < 0 || newQty > stock) return;
    dispatch(updateCartItem({ product, quantity: newQty }));
  };

  return (
    <div className="mx-auto max-w-7xl p-6">
      <h1 className="mb-4 text-3xl font-bold text-gray-900">Products Detail</h1>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* 图片 */}
          <div className="flex items-center justify-center rounded-md bg-gray-50">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="max-h-[420px] w-full object-contain"
              />
            ) : (
              <div className="py-24 text-gray-400">No image</div>
            )}
          </div>

          {/* 信息 */}
          <div>
            <div className="text-sm text-gray-500">{product.category}</div>
            <h2 className="mt-2 text-3xl font-bold text-gray-900">
              {product.name}
            </h2>

            <div className="mt-3 flex items-center gap-3">
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
              {outOfStock && (
                <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-600">
                  Out of Stock
                </span>
              )}
              {lowStock && (
                <span className="rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-700">
                  Only {stock} left
                </span>
              )}
            </div>

            <p className="mt-4 whitespace-pre-line text-sm text-gray-600">
              {product.description}
            </p>

            {/* 按钮区 */}
            <div className="mt-6 flex items-center gap-3">
              {quantity > 0 ? (
                <div className="flex items-center rounded-md bg-brand-500 text-white">
                  <button
                    type="button"
                    onClick={() => handleChangeQty(quantity - 1)}
                    className="h-11 w-11 hover:bg-white/15"
                  >
                    −
                  </button>
                  <span className="w-14 text-center font-semibold">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleChangeQty(quantity + 1)}
                    className="h-11 w-11 hover:bg-white/15"
                  >
                    +
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleAdd}
                  className="h-11 min-w-[160px] rounded-md bg-brand-500 px-6 font-semibold text-white hover:bg-brand-600"
                >
                  Add To Cart
                </button>
              )}

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => navigate(`/products/${product._id}/edit`)}
                  className="h-11 min-w-[120px] rounded-md border border-gray-300 bg-white px-6 font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
