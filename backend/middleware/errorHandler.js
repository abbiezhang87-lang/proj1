/**
 * 全局错误处理中间件
 * ------------------------------------------------------------------
 * 作用：把各路抛出来的异常统一包装成 JSON 响应。
 *
 * 必须挂在所有路由之后，否则抓不到上游的错误。
 * 签名必须是 4 个参数 (err, req, res, next)，Express 才会识别为错误中间件。
 *
 * 处理的几类常见错误：
 *  - Mongoose ValidationError   → 400，并把所有字段错误拼成一条提示
 *  - Mongoose CastError（:id 格式不合法）→ 400
 *  - 唯一索引冲突（code: 11000，比如邮箱已存在）→ 409
 *  - 其他未知错误                → 500（生产环境不返回 stack）
 */
const errorHandler = (err, req, res, next) => {
  // 如果响应头已经开始写了，再改 status 会抛 Express 错误，此时交给默认处理器
  if (res.headersSent) return next(err);

  // 优先使用 err.statusCode（CustomAPIError/手动设置），
  // 再退化到 res.statusCode（例如 notFound 提前设成 404），
  // 最后兜底 500
  let statusCode = err.statusCode || res.statusCode || 500;
  if (statusCode < 400) statusCode = 500; // 防御性：非 4xx/5xx 的状态码不合理

  let message = err.message || 'Server error';

  // Mongoose 数据校验失败：把每个字段的错误消息拼成一串，方便前端展示
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  // URL 里塞了不合法的 ObjectId（比如 /api/products/abc）
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Mongo 唯一索引冲突。比如注册时邮箱已存在
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value for ${field}`;
  }

  res.status(statusCode).json({
    message,
    // 只有非生产环境返回调用栈，方便调试；生产环境不泄露给客户端
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

/**
 * 404 兜底：所有业务路由都没命中时进入这里。
 * 必须放在 errorHandler 之前，让它把 404 当作普通错误传下去。
 */
export const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Not found - ${req.originalUrl}`));
};

export default errorHandler;
