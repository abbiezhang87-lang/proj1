import express from 'express';
import {
  login,
  register,
  requestPasswordReset,
  confirmPasswordReset,
  getMe,
} from '../controllers/auth.js';
import authToken from '../middleware/auth.js';

const router = express.Router();

router.post('/signin', login);
router.post('/signup', register);

router.get('/me', authToken, getMe);
router.post('/password/request', authToken, requestPasswordReset);
router.post('/password/confirm', confirmPasswordReset);

export default router;