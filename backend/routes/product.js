import express from 'express';
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from '../controllers/product.js';
import authToken, { isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllProducts);
router.get('/:id', getProductById);

router.post('/', authToken, isAdmin, createProduct);
router.put('/:id', authToken, isAdmin, updateProduct);
router.delete('/:id', authToken, isAdmin, deleteProduct);

export default router;
