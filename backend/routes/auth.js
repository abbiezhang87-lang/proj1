import express from 'express';
import {
    login,
    register,
    updatePassword,
    getMe,
} from '../controllers/auth.js';
import authToken from '../middleware/auth.js';

const router = express.Router();

router.post('/signin', login);
router.post('/signup', register);

router.get('/me', authToken, getMe);
router.put('/password', authToken, updatePassword);

export default router;