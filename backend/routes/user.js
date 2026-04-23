import express from 'express';
import {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
} from '../controllers/user.js';
import authToken, { isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authToken, isAdmin, getAllUsers);
router.get('/:id', authToken, getUser);
router.put('/:id', authToken, updateUser);
router.delete('/:id', authToken, isAdmin, deleteUser);

export default router;