import express from 'express';
import cors from 'cors';

import connectDB from './config/db.js';
import authRouter from './routes/auth.js';
import userRouter from './routes/user.js';
import productRouter from './routes/product.js';
import cartRouter from './routes/cart.js';
import errorHandler, { notFound } from './middleware/errorHandler.js';

/**
 * 服务入口文件
 * ------------------------------------------------------------------
 * 1. 这里不做 dotenv.config()，而是由 `node --env-file=../.env` 加载
 *    根目录下的 .env（需要 Node 20.6+），保证前后端共用同一份环境变量。
 * 2. connectDB() 一调用就尝试连接 MongoDB；连接失败时进程会退出。
 * 3. 路由按模块分到 /api/auth /api/users /api/products /api/cart。
 * 4. 所有路由之后才挂 notFound 和 errorHandler —— 顺序不能错，否则
 *    中间件接收不到未命中的请求或上游抛出的错误。
 */
const app = express();

// 连接数据库（内部会读 process.env.MONGO_URI）
connectDB();

// 允许跨域（Vite dev 服务器用 5173 端口调本服务的 5000 端口时必须）
app.use(cors());

// 解析 JSON body，单次最大 2MB（防止恶意大 body）
app.use(express.json({ limit: '2mb' }));

// 健康检查，部署时方便运维确认服务是否活着
app.get('/', (_req, res) => res.json({ message: 'Server is healthy' }));

// 业务路由挂载
app.use('/api/auth', authRouter);       // 登录 / 注册 / 改密码 / 取当前用户
app.use('/api/users', userRouter);      // 用户管理（管理员权限）
app.use('/api/products', productRouter); // 商品 CRUD（管理员写，其余只读）
app.use('/api/cart', cartRouter);       // 购物车（每个登录用户一份）

// 所有路由之后：404 兜底 + 统一错误响应
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
