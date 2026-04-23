/**
 * 共享的字段约束。AuthPage / ProductForm 都从这里读，保证规则只有一份。
 */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD = 6;
export const MIN_NAME = 2;

/**
 * Product field rules — reused by the Create/Edit page.
 */
export const productRules = {
  name: [{ required: true, message: 'Product name is required' }],
  description: [{ required: true, message: 'Description is required' }],
  category: [{ required: true, message: 'Category is required' }],
  price: [
    { required: true, message: 'Price is required' },
    {
      type: 'number',
      min: 0,
      message: 'Price must be greater than or equal to 0',
    },
  ],
  inStockQuantity: [
    { required: true, message: 'Stock quantity is required' },
    {
      type: 'number',
      min: 0,
      message: 'Stock quantity must be greater than or equal to 0',
    },
  ],
  imageUrl: [
    { required: true, message: 'Image URL is required' },
    { type: 'url', message: 'Please provide a valid URL (http/https)' },
  ],
};

/**
 * Format cents-safe numbers into the classic "$1,234.56" string.
 */
export const formatPrice = (n) => {
  const v = Number(n || 0);
  return `$${v.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};
