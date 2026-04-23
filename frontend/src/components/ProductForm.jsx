import { useEffect, useState } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Alert,
} from 'antd';
import { productRules } from '../utils/validators.js';

/**
 * 可复用的 Create / Edit 表单（Phase II #2b：两个页面共用同一个组件）
 * props: initialValues, onSubmit, submitText, loading, errorText
 */
const CATEGORIES = [
  'Category1',
  'Category2',
  'Category3',
  'Electronics',
  'Accessories',
];

const ProductForm = ({
  initialValues = {},
  onSubmit,
  submitText = 'Add Product',
  loading = false,
  errorText = null,
}) => {
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState(initialValues.imageUrl || '');

  // 用 _id 做依赖（稳定标量），不能直接依赖 initialValues 对象
  // 否则每次父组件 re-render 都会把用户输入清空
  useEffect(() => {
    form.setFieldsValue({
      name: '',
      description: '',
      category: 'Category1',
      price: 0,
      inStockQuantity: 0,
      imageUrl: '',
      ...initialValues,
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setImageUrl(initialValues.imageUrl || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues._id, form]);

  const handleUpload = () => {
    setImageUrl(form.getFieldValue('imageUrl') || '');
  };

  return (
    <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow">
      <h3 className="mb-6 text-xl font-semibold">
        {submitText === 'Add Product' ? 'Create Product' : 'Edit Product'}
      </h3>

      {errorText && (
        <Alert type="error" showIcon message={errorText} className="mb-4" />
      )}

      <Form form={form} layout="vertical" onFinish={onSubmit} requiredMark={false}>
        <Form.Item label="Product name" name="name" rules={productRules.name}>
          <Input placeholder="e.g. iWatch" size="large" />
        </Form.Item>

        <Form.Item
          label="Product Description"
          name="description"
          rules={productRules.description}
        >
          <Input.TextArea rows={4} placeholder="Describe the product" />
        </Form.Item>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Form.Item label="Category" name="category" rules={productRules.category}>
            <Select
              size="large"
              options={CATEGORIES.map((c) => ({ label: c, value: c }))}
            />
          </Form.Item>

          <Form.Item label="Price" name="price" rules={productRules.price}>
            <InputNumber
              min={0}
              step={0.01}
              size="large"
              prefix="$"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label="In Stock Quantity"
            name="inStockQuantity"
            rules={productRules.inStockQuantity}
          >
            <InputNumber min={0} size="large" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Add Image Link"
            name="imageUrl"
            rules={productRules.imageUrl}
          >
            <Input
              size="large"
              placeholder="http://"
              addonAfter={
                <Button
                  type="primary"
                  size="small"
                  onClick={handleUpload}
                  style={{ background: '#5e5adb', borderColor: '#5e5adb' }}
                >
                  Upload
                </Button>
              }
            />
          </Form.Item>
        </div>

        <div className="mb-6 flex min-h-[180px] items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="preview"
              className="max-h-56 max-w-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <span className="text-gray-400">image preview!</span>
          )}
        </div>

        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          size="large"
          style={{ background: '#5e5adb', borderColor: '#5e5adb', fontWeight: 600 }}
        >
          {submitText}
        </Button>
      </Form>
    </div>
  );
};

export default ProductForm;
