import api from './axios.js';

export const getCartApi = () => api.get('/cart');
export const addCartItemApi = (productId, quantity = 1) =>
  api.post('/cart/items', { productId, quantity });
export const updateCartItemApi = (productId, quantity) =>
  api.put(`/cart/items/${productId}`, { quantity });
export const removeCartItemApi = (productId) =>
  api.delete(`/cart/items/${productId}`);
export const applyPromoApi = (code) => api.post('/cart/promo', { code });
export const clearCartApi = () => api.delete('/cart');
