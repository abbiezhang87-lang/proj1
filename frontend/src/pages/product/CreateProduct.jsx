import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { useState } from 'react';
import ProductForm from '../../components/ProductForm.jsx';
import { createProduct } from '../../features/product/productSlice.js';

/**
 * /products/new — admin-only. Uses the shared ProductForm.
 */
const CreateProduct = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState(null);
  const currentStatus = useSelector((s) => s.product.status);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    setErrorText(null);
    const res = await dispatch(createProduct(values));
    setSubmitting(false);
    if (res.meta.requestStatus === 'fulfilled') {
      message.success('Product created');
      // Phase III #2a: should be shown immediately on list page
      navigate('/');
    } else {
      setErrorText(res.payload || 'Failed to create product');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <ProductForm
        onSubmit={handleSubmit}
        submitText="Add Product"
        loading={submitting || currentStatus === 'loading'}
        errorText={errorText}
      />
    </div>
  );
};

export default CreateProduct;
