import api from './axios.js';
export const placeOrderApi = () => api.post('/orders');
export const getMyOrdersApi = () => api.get('/orders');
