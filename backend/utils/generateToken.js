import jwt from 'jsonwebtoken';

/**
 * 生成 JWT token
 * ------------------------------------------------------------------
 * payload 刻意设计得很精简，只放 id + isAdmin：
 *   - id     ：用来在 authToken 中间件里反查 User 文档
 *   - isAdmin：作为"软提示"，让前端可以不调 /me 就判断是否管理员
 *              （真正的权限校验仍然以 DB 里的最新 isAdmin 为准）
 *
 * 为什么不把 name / email 塞进 payload？
 *   1. 用户改名/改邮箱后 token 里的信息会过期
 *   2. payload 越大 token 越长，每个请求都要带，浪费带宽
 *   3. 安全上能少放就少放
 *
 * expiresIn 默认 7 天，可以通过环境变量 JWT_EXPIRES_IN 覆盖
 */
const generateToken = (user) => {
  const payload = {
    id: user._id.toString(),
    isAdmin: user.isAdmin,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

export default generateToken;
