import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * 认证中间件
 * ------------------------------------------------------------------
 * 两个中间件：
 *   - authToken（默认导出）：校验 JWT，把用户挂到 req.user
 *   - isAdmin（命名导出）：在 authToken 之后使用，限制只有管理员能通过
 *
 * 用法示例（路由）：
 *   router.get('/me', authToken, getMe);
 *   router.post('/products', authToken, isAdmin, createProduct);
 */

/**
 * 校验 Authorization: Bearer <token>：
 *  1. 请求头里没有合法格式的 token → 401
 *  2. token 验签失败或过期       → 401（被 catch 兜住）
 *  3. token 合法但用户已被删除   → 401（防止删号后 token 还能用）
 *  4. 通过后把完整用户文档挂到 req.user，下游随用随取
 */
const authToken = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    // verify 失败会抛错（签名错/过期/格式不对），由 catch 兜成 401
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    // 无论是 verify 抛错还是 DB 抛错，统一返回 401
    // 不把 err.message 泄露给前端，避免暴露 JWT 结构细节
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

/**
 * 仅管理员可通过。
 * 必须在 authToken 之后链式调用，否则 req.user 是 undefined，
 * 这里 ?. 的兜底会直接让请求走到 403 分支。
 */
export const isAdmin = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
};

export default authToken;
