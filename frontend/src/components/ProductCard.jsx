import { Card, Button, InputNumber, Space, Popconfirm } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  addToCart,
  updateCartItem,
  selectCartQuantityFor,
} from '../features/cart/cartSlice.js';
import { deleteProduct } from '../features/product/productSlice.js';
import { formatPrice } from '../utils/validators.js';
import './ProductCard.css';

/**
 * ProductCard — used on the product list page.
 * - Regular user: "Add" button. After adding, shows +/- quantity controls.
 * - Admin: additionally shows Edit + Delete.
 * - Anonymous: hides both; clicking the card still opens details.
 */
const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoggedIn, isAdmin } = useSelector((s) => s.auth);
  const inCart = useSelector(selectCartQuantityFor(product._id));

  const onAdd = (e) => {
    e.stopPropagation();
    dispatch(addToCart({ product, quantity: 1 }));
  };

  const onChangeQty = (n) => {
    dispatch(updateCartItem({ product, quantity: Number(n) || 0 }));
  };

  const onDelete = () => {
    dispatch(deleteProduct(product._id));
  };

  return (
    <Card
      className="product-card"
      hoverable
      onClick={() => navigate(`/products/${product._id}`)}
      cover={
        <div className="product-img">
          <img src={product.imageUrl} alt={product.name} />
        </div>
      }
    >
      <div className="product-meta">
        <div className="product-name" title={product.name}>
          {product.name}
        </div>
        <div className="product-price">{formatPrice(product.price)}</div>
      </div>

      <div className="product-actions" onClick={(e) => e.stopPropagation()}>
        {inCart > 0 ? (
          <Space.Compact block>
            <Button onClick={() => onChangeQty(inCart - 1)}>-</Button>
            <InputNumber
              min={0}
              value={inCart}
              onChange={(v) => onChangeQty(v || 0)}
              controls={false}
              style={{ width: 60, textAlign: 'center' }}
            />
            <Button onClick={() => onChangeQty(inCart + 1)}>+</Button>
          </Space.Compact>
        ) : (
          <Button
            type="primary"
            block
            onClick={onAdd}
            disabled={!isLoggedIn && !inCart && false /* allow guests to add */}
            style={{ background: '#5e5adb', borderColor: '#5e5adb' }}
          >
            Add
          </Button>
        )}

        {isAdmin && (
          <div className="admin-row">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/products/${product._id}/edit`);
              }}
              block
            >
              Edit
            </Button>
            <Popconfirm
              title="Delete this product?"
              onConfirm={onDelete}
              okText="Delete"
              okButtonProps={{ danger: true }}
            >
              <Button danger block onClick={(e) => e.stopPropagation()}>
                Delete
              </Button>
            </Popconfirm>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProductCard;
