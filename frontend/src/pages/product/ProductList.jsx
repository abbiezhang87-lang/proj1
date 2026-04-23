import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Spin, Empty } from 'antd';
import ProductCard from '../../components/ProductCard.jsx';
import {
  fetchProducts,
  setPage,
  setSort,
  setQuery,
} from '../../features/product/productSlice.js';

/**
 * 商品列表页（首页）
 * Phase II #2a 主页 / Phase III #2a 新建立即显示 / #2e 分页 / 搜索
 * URL 里带 page/sort/q，刷新/分享都不掉状态
 * 响应式：1→2→3→4→5 col（lg 4 档是窄笔记本考虑，代价是 10 个会排 3 行）
 */
const sortOptions = [
  { value: 'latest', label: 'Last added' },
  { value: 'priceAsc', label: 'Price: low to high' },
  { value: 'priceDesc', label: 'Price: high to low' },
];

const ProductList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items, total, page, pages, limit, q, sort, status, error } =
    useSelector((s) => s.product);
  const { isAdmin } = useSelector((s) => s.auth);

  // URL → Redux（首次进入 / 粘贴链接）
  useEffect(() => {
    dispatch(setQuery(searchParams.get('q') || ''));
    dispatch(setSort(searchParams.get('sort') || 'latest'));
    dispatch(setPage(parseInt(searchParams.get('page'), 10) || 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Redux → URL（过滤条件变了同步上去）
  useEffect(() => {
    const next = {};
    if (q) next.q = q;
    if (sort !== 'latest') next.sort = sort;
    if (page !== 1) next.page = String(page);
    setSearchParams(next, { replace: true });
  }, [q, sort, page, setSearchParams]);

  // 任一条件变化 → 重新拉数据
  useEffect(() => {
    dispatch(fetchProducts({ page, limit, q, sort }));
  }, [dispatch, page, limit, q, sort]);

  const goTo = (p) => {
    if (p >= 1 && p <= pages) dispatch(setPage(p));
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Products
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {total} item{total === 1 ? '' : 's'} available
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={sort}
            onChange={(e) => dispatch(setSort(e.target.value))}
            className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          {isAdmin && (
            <button
              type="button"
              onClick={() => navigate('/products/new')}
              className="inline-flex h-10 items-center justify-center rounded-md bg-brand-500 px-4 text-sm font-medium text-white shadow-sm hover:bg-brand-600"
            >
              + Add Product
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {status === 'loading' ? (
        <div className="flex justify-center py-16">
          <Spin size="large" />
        </div>
      ) : items.length === 0 ? (
        <div className="py-16">
          <Empty description={q ? `No products matching "${q}"` : 'No products yet'} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {items.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>

          {/* 简单分页：Prev / 1 2 3 ... / Next */}
          {pages > 1 && (
            <nav className="mt-8 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => goTo(page - 1)}
                className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300"
              >
                Prev
              </button>
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => goTo(p)}
                  className={
                    p === page
                      ? 'h-9 min-w-[2.25rem] rounded-md border border-brand-500 bg-brand-500 px-3 text-sm font-medium text-white'
                      : 'h-9 min-w-[2.25rem] rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 hover:bg-gray-50'
                  }
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                disabled={page >= pages}
                onClick={() => goTo(page + 1)}
                className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300"
              >
                Next
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
};

export default ProductList;
