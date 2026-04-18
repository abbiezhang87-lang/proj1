import express from 'express';
import {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
} from '../controllers/user.js';
import authToken, { isAdmin } from '../middleware/auth.js';

/**
 * /api/users 路由表
 * ------------------------------------------------------------------
 *  GET    /          管理员   列出所有用户
 *  GET    /:id       登录     查单个用户
 *  PUT    /:id       登录     修改用户（controller 里再判定"自己或 admin"）
 *  DELETE /:id       管理员   删除用户
 *
 * 注意 PUT 路由没在这里加 isAdmin —— 普通用户需要能改自己的资料。
 * 更细粒度的权限判断在 controllers/user.js 的 updateUser 里。
 */
const router = express.Router();

router.get('/', authToken, isAdmin, getAllUsers);
router.get('/:id', authToken, getUser);
router.put('/:id', authToken, updateUser);
router.delete('/:id', authToken, isAdmin, deleteUser);

export default router;
