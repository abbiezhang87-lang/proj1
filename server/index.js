import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import express from 'express';
import connectDB from './config/db.js';
import authRouter from './routes/auth.js';
import userRouter from './routes/user.js';

//指定根目录下的 .env 路径
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.get('/', (req, res) => {
    res.json({ message: "Server is healthy" })
})

const Port = process.env.PORT || 5000;
app.listen(Port, () => {
    console.log(`Server is running on port ${Port}`);
})

