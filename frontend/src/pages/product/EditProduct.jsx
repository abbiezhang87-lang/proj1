import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { message, Spin } from 'antd';
import ProductForm from '../../components/ProductForm.jsx';
import {
  fetchProductById,
  updateProduct,
  clearCurrent,
} from '../../features/product/productSlice.js';

/**
 * /products/:id/edit — admin-only. Shares ProductForm with Create.
 * Phase III #2b: page should pre-populate the product details.
 */
const EditProduct = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const current = useSelector((s) => s.product.current);
  const status = useSelector((s) => s.product.status);
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState(null);

  useEffect(() => {
    dispatch(fetchProductById(id));
    return () => dispatch(clearCurrent());
  }, [dispatch, id]);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    setErrorText(null);
    const res = await dispatch(updateProduct({ id, payload: values }));
    setSubmitting(false);
    if (res.meta.requestStatus === 'fulfilled') {
      message.success('Product updated');
      navigate(`/products/${id}`);
    } else {
      setErrorText(res.payload || 'Failed to update product');
    }
  };

  if (!current && status === 'loading') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <ProductForm
        initialValues={current || {}}
        onSubmit={handleSubmit}
        submitText="Update Product"
        loading={submitting}
        errorText={errorText}
      />
    </div>
  );
};

export default EditProduct;
