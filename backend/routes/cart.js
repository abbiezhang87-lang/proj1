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

const router = express.Router();
router.use(authToken);

router.get('/', getCart);
router.delete('/', clearCart);

router.post('/items', addItem);
router.put('/items/:productId', updateItem);
router.delete('/items/:productId', removeItem);

router.post('/promo', applyPromo);

export default router;
