import api from './axios.js';

/**
 * Orders endpoints. All require a logged-in user (server enforces).
 *
 * 对应 /api/orders：
 *   - placeOrderApi  POST / —— 把当前购物车结成一个订单（并清空购物车）
 *   - getMyOrdersApi GET  / —— 取当前用户的历史订单列表
 */
export const placeOrderApi = () => api.post('/orders');
export const getMyOrdersApi = () => api.get('/orders');
