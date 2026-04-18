import express from 'express';
import { getAllUsers, getUser, updateUser, deleteUser } from '../controllers/user.js';


const router = express.Router();

// 只有经过 auth 验证且是 admin 的人才能 get '/'
//router.get('/', auth, admin, getAllUsers);
router.get('/:id', getUser);
//router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;