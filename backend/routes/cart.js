import express from 'express';
import {
  getCart,
  addItem,
  updateItem,
  removeItem,
  applyPromo,
  clearCart,
} from '../controllers/cart.js';
import authToken from '../middleware/auth.js';

/**
 * /api/cart 路由表
 * ------------------------------------------------------------------
 * 所有接口都必须登录 —— 这里用 router.use(authToken) 统一挂一次，
 * 比在每个路由后面重复写要干净。
 *
 *  GET    /                      取当前用户的购物车
 *  DELETE /                      清空购物车（结算后用）
 *  POST   /items                 加商品到购物车
 *  PUT    /items/:productId      修改某商品的数量（0 = 移除）
 *  DELETE /items/:productId      移除某商品
 *  POST   /promo                 应用优惠码
 */
const router = express.Router();

// 购物车全部需要登录 —— 游客版购物车是前端用 localStorage 维护的
router.use(authToken);

router.get('/', getCart);
router.delete('/', clearCart);

router.post('/items', addItem);
router.put('/items/:productId', updateItem);
router.delete('/items/:productId', removeItem);

router.post('/promo', applyPromo);

export default router;
