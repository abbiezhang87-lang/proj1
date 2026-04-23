import express from 'express';
import { placeOrder, getMyOrders } from '../controllers/order.js';
import authToken from '../middleware/auth.js';

/**
 * /api/orders 路由表（额外功能 —— Order History）
 * ------------------------------------------------------------------
 * 所有接口都必须登录，所以直接 router.use(authToken)。
 *
 *  POST /   下单：把当前购物车快照成 Order + 清空购物车
 *  GET  /   查询当前登录用户的历史订单（按时间倒序）
 */
const router = express.Router();

router.use(authToken);

router.post('/', placeOrder);
router.get('/', getMyOrders);

export default router;
