/**
 * Shared Ant Design form validation rule factories. Keeping these
 * in one file means SignIn/SignUp/UpdatePassword share identical
 * error messages (requirement Phase I #2: "enough validations").
 */
export const emailRules = [
  { required: true, message: 'Email is required' },
  {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Enter a valid email address',
  },
];

export const passwordRules = [
  { required: true, message: 'Password is required' },
  { min: 6, message: 'Password must be at least 6 characters long' },
];

export const nameRules = [
  { required: true, message: 'Name is required' },
  { min: 2, message: 'Name must be at least 2 characters' },
];

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
