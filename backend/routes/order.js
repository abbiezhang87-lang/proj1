import express from 'express';
import { placeOrder, getMyOrders } from '../controllers/order.js';
import authToken from '../middleware/auth.js';

const router = express.Router();

router.use(authToken);

router.post('/', placeOrder);
router.get('/', getMyOrders);

export default router;
