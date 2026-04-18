import mongoose from 'mongoose';

/**
 * 连接 MongoDB
 * ------------------------------------------------------------------
 * 1. 使用环境变量 MONGO_URI（来自根目录 .env）
 * 2. 连接成功打印 host，方便排查连错数据库的问题
 * 3. 连接失败直接 process.exit(1)，让容器/pm2 自动重启
 *    —— 这是生产环境推荐的"fail fast"策略
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
