import { useEffect, useState } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Card,
  Typography,
  Row,
  Col,
  Alert,
} from 'antd';
import { productRules } from '../utils/validators.js';

const { Title } = Typography;
const { TextArea } = Input;

/**
 * Reusable product create/edit form.
 * Phase II requirement #2b: Create page and Edit page share the SAME component.
 *
 * Props:
 *   initialValues  pre-populated values for edit mode (Phase III #2b)
 *   onSubmit       (values) => Promise
 *   submitText     'Add Product' | 'Update Product'
 *   loading        boolean
 *   errorText      optional error banner
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

  // When switching between products (edit page), reset the form
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
    setImageUrl(initialValues.imageUrl || '');
  }, [initialValues._id, form]); /*
默认参数 initialValues = {} 每次 render 都是新对象引用，
作为 useEffect 依赖会让任何 re-render
（比如点 Upload 按钮）都触发 form.setFieldsValue('') 把用户输入清空；
改成依赖稳定标量 _id（Create 页恒为 undefined，Edit 页只在商品数据到达时变一次），
就只在真正需要重置的时候才跑。 */

  const handleUpload = () => {
    const v = form.getFieldValue('imageUrl');
    setImageUrl(v || '');
  };

  return (
    <Card style={{ maxWidth: 720, margin: '0 auto' }}>
      <Title level={3} style={{ marginBottom: 24 }}>
        {submitText === 'Add Product' ? 'Create Product' : 'Edit Product'}
      </Title>

      {errorText ? (
        <Alert
          type="error"
          showIcon
          message={errorText}
          style={{ marginBottom: 16 }}
        />
      ) : null}

      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        requiredMark={false}
      >
        <Form.Item
          label="Product name"
          name="name"
          rules={productRules.name}
        >
          <Input placeholder="e.g. iWatch" size="large" />
        </Form.Item>

        <Form.Item
          label="Product Description"
          name="description"
          rules={productRules.description}
        >
          <TextArea rows={4} placeholder="Describe the product" />
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Category"
              name="category"
              rules={productRules.category}
            >
              <Select size="large" options={CATEGORIES.map((c) => ({ label: c, value: c }))} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Price" name="price" rules={productRules.price}>
              <InputNumber
                min={0}
                step={0.01}
                style={{ width: '100%' }}
                size="large"
                prefix="$"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="In Stock Quantity"
              name="inStockQuantity"
              rules={productRules.inStockQuantity}
            >
              <InputNumber min={0} style={{ width: '100%' }} size="large" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
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
                    style={{
                      backgroundColor: '#5e5adb',
                      borderColor: '#5e5adb',
                    }}
                  >
                    Upload
                  </Button>
                }
              />
            </Form.Item>
          </Col>
        </Row>

        <div
          style={{
            border: '2px dashed #d9d9d9',
            borderRadius: 8,
            minHeight: 180,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
            overflow: 'hidden',
            background: '#fafafa',
          }}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="preview"
              style={{
                maxHeight: 220,
                maxWidth: '100%',
                objectFit: 'contain',
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <span style={{ color: '#999' }}>image preview!</span>
          )}
        </div>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            size="large"
            style={{
              backgroundColor: '#5e5adb',
              borderColor: '#5e5adb',
              fontWeight: 600,
            }}
          >
            {submitText}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ProductForm;
