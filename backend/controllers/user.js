import User from '../models/User.js';

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}, 'name email isAdmin avatar');
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

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