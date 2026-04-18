import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Row, Col, Select, Button, Pagination, Empty, Spin, Alert } from 'antd';
import ProductCard from '../../components/ProductCard.jsx';
import {
  fetchProducts,
  setPage,
  setSort,
  setQuery,
} from '../../features/product/productSlice.js';
import './ProductList.css';

/**
 * 商品列表页（首页）
 * ------------------------------------------------------------------
 * 覆盖需求：
 *  - Phase II #2a 主页
 *  - Phase III #2a 新建商品立即在列表最上方
 *  - Phase III #2e 分页
 *  - 搜索（来自 Header 的搜索框 → state.product.q）
 *
 * ★ 修复 Chuwa 文档 "改进点 #3"：
 *   "分页的参数可以体现在 url 里面，包括排序的参数，这样用户刷新也
 *    可以得到相同的结果"
 *
 *   实现策略：用 react-router 的 useSearchParams 做双向绑定
 *     URL → Redux   初次进入/直接粘贴链接时，从 URL 读参数写进 Redux
 *     Redux → URL   Redux 里分页/排序/搜索变化时，同步写到 URL
 *
 *   这样用户分享 /?q=phone&sort=priceAsc&page=2 给朋友，对方打开
 *   就是同样的结果集；用户刷新也不掉状态。
 */
const sortOptions = [
  { value: 'latest', label: 'Last added' },
  { value: 'priceAsc', label: 'Price: low to high' },
  { value: 'priceDesc', label: 'Price: high to low' },
];

const VALID_SORTS = new Set(sortOptions.map((o) => o.value));

const ProductList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items, total, page, pages, limit, q, sort, status, error } =
    useSelector((s) => s.product);
  const { isAdmin } = useSelector((s) => s.auth);

  /**
   * 第一次挂载 & URL 变化时：从 URL 读参数写回 Redux。
   * 注意 { replace: true } 防止 back 键历史里塞满每次 setQuery 的记录。
   */
  useEffect(() => {
    const urlQ = searchParams.get('q') || '';
    const urlSort = searchParams.get('sort') || 'latest';
    const urlPage = parseInt(searchParams.get('page'), 10) || 1;

    // 只 dispatch 差异部分，避免无意义 re-render
    if (urlQ !== q) dispatch(setQuery(urlQ));
    if (VALID_SORTS.has(urlSort) && urlSort !== sort) dispatch(setSort(urlSort));
    if (urlPage !== page) dispatch(setPage(urlPage));
    // 这里故意不把 q/sort/page 写入依赖数组 —— 否则会和下方 effect 循环
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  /**
   * Redux 状态变化时：同步到 URL。
   * 把 "默认值"（q='', sort='latest', page=1）从 URL 里省掉，让链接更干净。
   */
  useEffect(() => {
    const next = {};
    if (q) next.q = q;
    if (sort && sort !== 'latest') next.sort = sort;
    if (page && page !== 1) next.page = String(page);
    // 用 replace 避免每次打字都 push 一条历史
    setSearchParams(next, { replace: true });
  }, [q, sort, page, setSearchParams]);

  /**
   * 真正拉数据：任何筛选条件变化都重新请求服务端。
   */
  useEffect(() => {
    dispatch(fetchProducts({ page, limit, q, sort }));
  }, [dispatch, page, limit, q, sort]);

  return (
    <div className="products-page">
      <div className="products-header">
        <h2>Products</h2>
        <div className="products-controls">
          <Select
            value={sort}
            onChange={(v) => dispatch(setSort(v))}
            options={sortOptions}
            style={{ width: 180 }}
          />
          {isAdmin && (
            <Button
              type="primary"
              onClick={() => navigate('/products/new')}
              style={{ background: '#5e5adb', borderColor: '#5e5adb' }}
            >
              Add Product
            </Button>
          )}
        </div>
      </div>

      {error ? (
        <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} />
      ) : null}

      {status === 'loading' ? (
        <div className="center-block">
          <Spin size="large" />
        </div>
      ) : items.length === 0 ? (
        <Empty description={q ? `No products matching "${q}"` : 'No products yet'} />
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {items.map((p) => (
              <Col key={p._id} xs={24} sm={12} md={8} lg={6} xl={4}>
                <ProductCard product={p} />
              </Col>
            ))}
          </Row>

          <div className="pagination-row">
            <Pagination
              current={page}
              total={total}
              pageSize={limit}
              onChange={(p) => dispatch(setPage(p))}
              showSizeChanger={false}
              hideOnSinglePage
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ProductList;
