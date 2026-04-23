import User from '../models/User.js';

/**
 * 用户控制器（user controller）
 * ------------------------------------------------------------------
 * 用户管理接口：
 *  - list / delete 仅管理员（路由层守卫）
 *  - get / update 允许"自己"或管理员
 *  - isAdmin 字段只能被管理员修改（防止普通用户自己给自己提权）
 */

/**
 * GET /api/users （仅管理员）
 * 只返回必要字段，不要把 password / __v 带出去。
 * 这里用 Mongoose 的投影参数 "name email isAdmin avatar" 做字段筛选，
 * 减少出参体积 & 防止敏感字段泄露。
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}, 'name email isAdmin avatar');
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/users/:id （需要登录）
 */
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/users/:id （需要登录）
 *
 * 权限规则：
 *  1. 只能修改自己，或者当前登录用户是管理员
 *  2. isAdmin 这个字段特别敏感：只有管理员才能改；
 *     普通用户即便改自己的资料，请求里带了 isAdmin:true 也会被忽略
 *  3. 用 ??（空值合并） 保留未传字段的旧值，避免把 name 置空
 */
export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // 权限：只能改自己，或者是管理员
    if (
      req.user._id.toString() !== user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({ message: 'Not allowed' });
    }

    user.name = req.body.name ?? user.name;
    user.email = req.body.email ?? user.email;
    user.avatar = req.body.avatar ?? user.avatar;

    // 只有管理员能修改 isAdmin，防止普通用户自己给自己提权
    if (req.body.isAdmin !== undefined && req.user.isAdmin) {
      user.isAdmin = req.body.isAdmin;
    }

    const updated = await user.save();
    res.status(200).json({ message: 'User updated successfully', user: updated });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/users/:id （仅管理员）
 * 注意：生产环境最好加一个"不能删除自己"的兜底，避免 admin 误删后
 * 系统陷入没有管理员的死局
 */
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await user.deleteOne();
    res.status(200).json({ message: 'User removed successfully' });
  } catch (err) {
    next(err);
  }
};
