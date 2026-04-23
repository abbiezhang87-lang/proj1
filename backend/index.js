import express from 'express';
import cors from 'cors';

import connectDB from './config/db.js';
import authRouter from './routes/auth.js';
import userRouter from './routes/user.js';
import productRouter from './routes/product.js';
import cartRouter from './routes/cart.js';
import orderRouter from './routes/order.js';
import errorHandler, { notFound } from './middleware/errorHandler.js';

const app = express();

connectDB();

app.use(cors());

app.use(express.json({ limit: '2mb' }));

app.get('/', (_req, res) => res.json({ message: 'Server is healthy' }));

app.use('/api/auth', authRouter);       // 登录 / 注册 / 改密码 / 取当前用户
app.use('/api/users', userRouter);      // 用户管理（管理员权限）
app.use('/api/products', productRouter); // 商品 CRUD（管理员写，其余只读）
app.use('/api/cart', cartRouter);       // 购物车（每个登录用户一份）
app.use('/api/orders', orderRouter);    // 订单（额外功能：Order History）

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
