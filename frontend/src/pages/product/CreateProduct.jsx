import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import ProductForm from '../../components/ProductForm.jsx';
import { createProduct } from '../../features/product/productSlice.js';

/** /products/new — admin only，复用 ProductForm */
const CreateProduct = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [errorText, setErrorText] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    setErrorText(null);
    const res = await dispatch(createProduct(values));
    setLoading(false);
    if (res.meta.requestStatus === 'fulfilled') {
      message.success('Product created');
      navigate('/'); // Phase III #2a：新建后立即显示在列表
    } else {
      setErrorText(res.payload || 'Failed to create product');
    }
  };

  return (
    <div className="p-6">
      <ProductForm
        onSubmit={handleSubmit}
        submitText="Add Product"
        loading={loading}
        errorText={errorText}
      />
    </div>
  );
};

export default CreateProduct;
