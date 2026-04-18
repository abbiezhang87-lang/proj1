import express from 'express';
import {
  login,
  register,
  updatePassword,
  getMe,
} from '../controllers/auth.js';
import authToken from '../middleware/auth.js';

/**
 * /api/auth 路由表
 * ------------------------------------------------------------------
 *  POST /signin     公开  登录
 *  POST /signup     公开  注册
 *  GET  /me         需登录 取当前用户（页面刷新时前端用来 rehydrate Redux）
 *  PUT  /password   需登录 修改密码
 *
 * 带 authToken 的路由会把 req.user 挂好，controller 可以直接用。
 */
const router = express.Router();

// 公开接口
router.post('/signin', login);
router.post('/signup', register);

// 需要登录
router.get('/me', authToken, getMe);
router.put('/password', authToken, updatePassword);

export default router;
