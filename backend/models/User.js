import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import gravatar from 'gravatar';

/**
 * 用户（User）Schema
 * ------------------------------------------------------------------
 * 关键设计：
 *  - isAdmin 决定权限：只有管理员能创建/修改/删除商品
 *  - password 字段加了 select: false，默认查询不会返回密码字段，
 *    这样 "findOne({ email })" 不会把密码泄露给任何 handler
 *  - 登录时要显式 .select('+password') 才能拿到哈希做比对
 *    （这是原代码漏掉的地方，导致登录永远失败）
 */
const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,       // 同一邮箱只能注册一次
      trim: true,
      lowercase: true,    // 存储前统一转小写，避免大小写不一致
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: true,
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,      // 默认不查出，登录时要 .select('+password')
    },
    avatar: { type: String, default: '' },
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true },   // 自动加 createdAt / updatedAt
);

/**
 * 保存前钩子：
 *  1. 如果用户没传头像，自动用 gravatar 根据邮箱生成一个
 *  2. 如果 password 字段被修改了，才做加密（防止每次更新
 *     用户信息都重新哈希一次，导致登录失败）
 *
 * 重要：一定要调用 next()，否则 save() 永远 pending。
 * 这是原代码里最严重的 bug（正常分支漏了 next()）。
 * bug：用户无法注册，报next is not a function，因为 next 没有被调用，
 * Mongoose v9 重要变化：
 *   当钩子是 async function 时，Mongoose 不再把 next 作为参数传入
 *   （它认为 async 函数应该用 return 的 Promise 来通知完成，
 *   不要再混用 next 回调）。所以这里 *不能* 写成
 *   `async function (next)` 然后调 next() —— 那会抛
 *   "next is not a function"。
 *   推荐写法：纯 async/await，函数 return 即视为完成；
 *   提前结束就 `return`。解决方案：删除next。
 */
UserSchema.pre('save', async function () {
  // 补默认头像
  if (!this.avatar) {
    this.avatar = gravatar.url(this.email, { s: '200', r: 'pg', d: 'mm' });
  }

  // 密码没改就直接放行
  if (!this.isModified('password')) return;//v9 不再把 next 传进 async 钩子

  // 明文 → bcrypt 哈希（10 轮 salt 是业界默认）
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * 实例方法：校验明文密码是否匹配存储的哈希
 * 用法：user.matchPassword('123456')  →  true / false
 */
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default model('User', UserSchema);
