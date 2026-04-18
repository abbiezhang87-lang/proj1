import express from 'express';
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from '../controllers/product.js';
import authToken, { isAdmin } from '../middleware/auth.js';

/**
 * /api/products 路由表
 * ------------------------------------------------------------------
 *  GET    /            公开   列表（支持 page / limit / q / sort 查询参数）
 *  GET    /:id         公开   详情
 *  POST   /            管理员 创建
 *  PUT    /:id         管理员 更新
 *  DELETE /:id         管理员 删除
 *
 * 列表 / 详情任何人都能访问 —— 游客也能逛。
 * 写操作必须先过 authToken，再过 isAdmin，两道闸。
 */
const router = express.Router();

// 公开：列表 + 详情
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// 管理员：写操作
router.post('/', authToken, isAdmin, createProduct);
router.put('/:id', authToken, isAdmin, updateProduct);
router.delete('/:id', authToken, isAdmin, deleteProduct);

export default router;
