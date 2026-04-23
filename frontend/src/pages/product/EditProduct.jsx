import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import ProductForm from '../../components/ProductForm.jsx';
import {
  fetchProductById,
  updateProduct,
  deleteProduct,
  clearCurrent,
} from '../../features/product/productSlice.js';

/**
 * 编辑商品页 /products/:id/edit（仅管理员可访问）
 * ------------------------------------------------------------------
 * - 上半部分：ProductForm（创建商品页也用它，一套表单复用）
 * - 下半部分：Danger zone —— 红色警示区，装 Delete 按钮
 *   点 Delete → 浏览器原生 confirm 二次确认，避免误删
 */
const EditProduct = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const product = useSelector((s) => s.product.current);
  const loading = useSelector((s) => s.product.status === 'loading');
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
      navigate(`/products/${id}`);
    } else {
      setErrorText(res.payload || 'Failed to update product');
    }
  };

  const handleDelete = async () => {
    // 用浏览器内置的 confirm 弹窗 —— 不依赖第三方 UI 库
    const ok = window.confirm(
      'Delete this product? This action cannot be undone.',
    );
    if (!ok) return;

    const res = await dispatch(deleteProduct(id));
    if (res.meta.requestStatus === 'fulfilled') {
      navigate('/');
    } else {
      alert(res.payload || 'Failed to delete product');
    }
  };

  if (loading && !product) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <ProductForm
        initialValues={product || {}}
        onSubmit={handleSubmit}
        submitText="Update Product"
        loading={submitting}
        errorText={errorText}
      />

      {/* Danger zone */}
      <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
        <h3 className="mb-1 text-sm font-semibold text-red-700">Danger zone</h3>
        <p className="mb-3 text-sm text-red-700">
          Deleting this product is permanent and cannot be undone.
        </p>
        <button
          type="button"
          onClick={handleDelete}
          className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          Delete product
        </button>
      </div>
    </div>
  );
};

export default EditProduct;
