import User from "../models/User.js";

// 获取所有用户 (仅管理员可用，返回 email 和 isAdmin 状态)
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, 'name email isAdmin avatar');

        if (!users || users.length === 0) {
            return res.status(404).json({ message: "No users found" });
        }

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 获取单个用户详情
export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 更新用户信息
export const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.avatar = req.body.avatar || user.avatar;
            // 只有手动指定时才更改 isAdmin
            if (req.body.isAdmin !== undefined) {
                user.isAdmin = req.body.isAdmin;
            }

            const updatedUser = await user.save();
            res.status(200).json({
                message: "User updated successfully",
                user: updatedUser
            });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 删除用户
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            await User.findByIdAndDelete(req.params.id);
            res.status(200).json({ message: "User removed successfully" });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};