import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

const publicUser = (u) => ({
    id: u._id.toString(),
    name: u.name,
    email: u.email,
    avatar: u.avatar,
    isAdmin: u.isAdmin,
});

export const register = async (req, res, next) => {
    try {
        const { name, email, password, avatar } = req.body;

        if (!name || !email || !password) {
            return res
                .status(400)
                .json({ message: 'Name, email and password are required' });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const isAdmin = email.toLowerCase().endsWith('@maildrop.cc');
        const newUser = await User.create({
            name,
            email,
            password,
            avatar,
            isAdmin,
        });

        res.status(201).json({
            message: 'User created successfully',
            user: publicUser(newUser),
            token: generateToken(newUser),
        });
    } catch (err) {
        next(err);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {

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

        const user = await User.findById(req.user._id).select('+password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const ok = await user.matchPassword(currentPassword);
        if (!ok) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({
            message: 'Password updated successfully',
            user: publicUser(user),
            token: generateToken(user),
        });
    } catch (err) {
        next(err);
    }
};

export const getMe = async (req, res, next) => {
    try {

        res.json({ user: publicUser(req.user) });
    } catch (err) {
        next(err);
    }
};