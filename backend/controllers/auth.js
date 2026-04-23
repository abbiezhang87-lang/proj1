import crypto from 'crypto';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { sendEmail } from '../utils/mailer.js';

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
    // @maildrop.cc 自动授管理员（跟 Figma 内部员工场景对齐）
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

/** POST /api/auth/signin */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      // 统一文案，防账号枚举
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

export const requestPasswordReset = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 小时

    user.pendingPasswordHash = undefined;
    user.resetToken = token;
    user.resetTokenExpires = expires;
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const link = `${frontendUrl}/reset-password?token=${token}`;

    console.log('[auth] 🔗 password reset link for %s:\n  %s', user.email, link);

    await sendEmail({
      to: user.email,
      subject: 'Reset your password — Management Chuwa',
      text:
        `Hi ${user.name},\n\n` +
        `You requested to update your password. Click the link below to ` +
        `set a new password (valid for 1 hour):\n\n${link}\n\n` +
        `If you didn't request this, you can safely ignore this email — ` +
        `your old password is still active.\n`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:520px;margin:auto;padding:24px;">
          <h2 style="color:#5e5adb;margin-top:0;">Reset your password</h2>
          <p>Hi ${user.name},</p>
          <p>You requested to update your password on <strong>Management Chuwa</strong>. Click the button below to set a new password (valid for 1 hour):</p>
          <p style="text-align:center;margin:32px 0;">
            <a href="${link}" style="background:#5e5adb;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;display:inline-block;">Set a new password</a>
          </p>
          <p style="color:#666;font-size:13px;">Or copy this link into your browser:<br><span style="word-break:break-all;">${link}</span></p>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
          <p style="color:#888;font-size:13px;">If you didn't request this, you can safely ignore this email — your old password is still active.</p>
        </div>`,
    });

    res.status(200).json({
      message: 'Confirmation email sent. Please check your inbox.',
      email: user.email,
    });
  } catch (err) {
    next(err);
  }
};

export const confirmPasswordReset = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }
    if (!newPassword || newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findOne({ resetToken: token }).select(
      '+password +pendingPasswordHash +resetToken +resetTokenExpires',
    );
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired link' });
    }
    if (!user.resetTokenExpires || user.resetTokenExpires < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired link' });
    }

    // 写明文新密码，靠 User model 的 pre('save') 自动哈希
    user.password = newPassword;
    user.pendingPasswordHash = undefined;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
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

/** GET /api/auth/me */
export const getMe = async (req, res, next) => {
  try {
    res.json({ user: publicUser(req.user) });
  } catch (err) {
    next(err);
  }
};
