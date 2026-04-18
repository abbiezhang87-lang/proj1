import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button,
  Row,
  Col,
  Spin,
  Tag,
  InputNumber,
  Space,
  Popconfirm,
} from 'antd';
import {
  fetchProductById,
  deleteProduct,
  clearCurrent,
} from '../../features/product/productSlice.js';
import {
  addToCart,
  updateCartItem,
  selectCartQuantityFor,
} from '../../features/cart/cartSlice.js';
import { formatPrice } from '../../utils/validators.js';

/**
 * /products/:id — single product detail page.
 * Shows quantity on page (Phase III #2d) and admin Edit/Delete.
 */
const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const current = useSelector((s) => s.product.current);
  const status = useSelector((s) => s.product.status);
  const { isAdmin } = useSelector((s) => s.auth);
  const inCart = useSelector(selectCartQuantityFor(id));

  useEffect(() => {
    dispatch(fetchProductById(id));
    return () => dispatch(clearCurrent());
  }, [dispatch, id]);

  if (status === 'loading' || !current) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
        <Spin size="large" />
      </div>
    );
  }

  const onAdd = () => dispatch(addToCart({ product: current, quantity: 1 }));
  const onChangeQty = (q) =>
    dispatch(updateCartItem({ product: current, quantity: Number(q) || 0 }));
  const onDelete = async () => {
    await dispatch(deleteProduct(current._id));
    navigate('/');
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
      <Button type="link" onClick={() => navigate(-1)}>
        ← Back
      </Button>
      <Row gutter={32} style={{ marginTop: 12 }}>
        <Col xs={24} md={12}>
          <div
            style={{
              background: '#f5f5f7',
              borderRadius: 8,
              padding: 24,
              minHeight: 360,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={current.imageUrl}
              alt={current.name}
              style={{ maxWidth: '100%', maxHeight: 420, objectFit: 'contain' }}
            />
          </div>
        </Col>
        <Col xs={24} md={12}>
          <Tag color="purple">{current.category}</Tag>
          <h1 style={{ marginTop: 12, marginBottom: 8 }}>{current.name}</h1>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#5e5adb' }}>
            {formatPrice(current.price)}
          </div>
          <p style={{ margin: '16px 0', color: '#5a6278' }}>
            {current.description}
          </p>
          <p style={{ color: '#5a6278' }}>
            In stock: <strong>{current.inStockQuantity}</strong>
          </p>

          <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {inCart > 0 ? (
              <Space.Compact>
                <Button onClick={() => onChangeQty(inCart - 1)}>-</Button>
                <InputNumber
                  min={0}
                  value={inCart}
                  controls={false}
                  onChange={(v) => onChangeQty(v || 0)}
                  style={{ width: 72, textAlign: 'center' }}
                />
                <Button onClick={() => onChangeQty(inCart + 1)}>+</Button>
              </Space.Compact>
            ) : (
              <Button
                type="primary"
                size="large"
                onClick={onAdd}
                style={{
                  background: '#5e5adb',
                  borderColor: '#5e5adb',
                  minWidth: 160,
                }}
              >
                Add to Cart
              </Button>
            )}

            {isAdmin && (
              <>
                <Button
                  size="large"
                  onClick={() => navigate(`/products/${current._id}/edit`)}
                >
                  Edit
                </Button>
                <Popconfirm
                  title="Delete this product?"
                  onConfirm={onDelete}
                  okText="Delete"
                  okButtonProps={{ danger: true }}
                >
                  <Button danger size="large">
                    Delete
                  </Button>
                </Popconfirm>
              </>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default ProductDetail;
