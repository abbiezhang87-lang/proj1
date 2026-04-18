import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

/**
 * 认证控制器（auth controller）
 * ------------------------------------------------------------------
 * 提供注册、登录、修改密码、获取当前用户四个接口。
 * 所有接口统一：
 *  - 失败通过 res.status(xxx).json({ message }) 返回
 *  - 真·异常（数据库挂了、Schema 校验失败等）交给 next(err)，
 *    由全局 errorHandler 统一处理
 *  - 返回 user 之前一律经过 publicUser 脱敏，防止 password/_v 泄露
 */

/**
 * 把 Mongoose 文档转成给前端的 "安全用户对象"。
 * 注意永远不要把 password / __v 直接丢给前端。
 */
const publicUser = (u) => ({
  id: u._id.toString(),
  name: u.name,
  email: u.email,
  avatar: u.avatar,
  isAdmin: u.isAdmin,
});

/**
 * POST /api/auth/signup
 * Body: { name, email, password, avatar? }
 *
 * 业务规则：邮箱以 @maildrop.cc 结尾的自动标记为管理员 —— 用来
 * 匹配 Figma 里"公司内部员工"的场景。真·生产环境请改成邀请制
 * 或手动提权，不要用域名判断（太容易伪造）。
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, avatar } = req.body;

    // 基础必填校验（Schema 也会再校验一次，这里提前返回 400 体验更好）
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Name, email and password are required' });
    }

    // 邮箱唯一性校验：避免重复注册
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // @maildrop.cc 邮箱自动授予管理员权限
    const isAdmin = email.toLowerCase().endsWith('@maildrop.cc');
    const newUser = await User.create({
      name,
      email,
      password, // 明文传入，Schema 的 pre('save') 钩子会自动哈希
      avatar,
      isAdmin,
    });

    // 注册成功直接发 token，省掉前端"注册后自动登录"的二次请求
    res.status(201).json({
      message: 'User created successfully',
      user: publicUser(newUser),
      token: generateToken(newUser),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/signin
 * Body: { email, password }
 *
 * 关键点：User.findOne 必须 .select('+password')，因为 Schema 里
 * password 设了 select: false，否则查出来的 user.password 是 undefined，
 * matchPassword 永远返回 false —— 这就是原代码登录永远失败的 bug。
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // .select('+password') 显式带上密码字段做哈希比对
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      // 不告诉前端是"邮箱不存在"还是"密码错" —— 防止账号枚举攻击
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const ok = await user.matchPassword(password);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.status(200).json({
      message: 'User logged in successfully',
      user: publicUser(user),
      token: generateToken(user),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/auth/password
 * Body: { currentPassword, newPassword }
 * 需要登录。
 *
 * 改密码流程：
 *  1. 校验旧密码是否正确（防止别人拿到 token 就随便改密码）
 *  2. 直接赋值 user.password，save() 时 pre('save') 会自动哈希
 *  3. 返回新 token —— 保证会话不失效，同时不必重新登录
 */
export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: 'Current and new password are required' });
    }
    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: 'New password must be at least 6 characters' });
    }

    // 同样要 .select('+password') 才能拿到哈希做比对
    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const ok = await user.matchPassword(currentPassword);
    if (!ok) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save(); // pre('save') 钩子会重新哈希新密码

    res.status(200).json({
      message: 'Password updated successfully',
      user: publicUser(user),
      token: generateToken(user),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 * 返回当前登录用户信息。
 * 前端页面刷新后会调这个接口，用来把 Redux 里的 user 重新 hydrate 回来
 * —— 避免只凭 localStorage 里的 token 就认定用户已登录。
 */
export const getMe = async (req, res, next) => {
  try {
    // req.user 由 authToken 中间件挂上
    res.json({ user: publicUser(req.user) });
  } catch (err) {
    next(err);
  }
};
