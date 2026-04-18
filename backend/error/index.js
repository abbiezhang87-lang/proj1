/**
 * 自定义业务错误类
 * ------------------------------------------------------------------
 * 让 controller 可以像这样抛错，携带 HTTP 状态码：
 *
 *   throw new CustomAPIError('Product not found', 404);
 *
 * 配合全局 errorHandler 中间件，会被直接转成：
 *   res.status(404).json({ message: 'Product not found' })
 *
 * 好处：
 *  - controller 里不用再写一堆 res.status(xxx).json(...) 的样板
 *  - 错误路径一致，便于日后接 Sentry / 日志聚合
 */
class CustomAPIError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'CustomAPIError'; // 方便排查和日志过滤
  }
}

export default CustomAPIError;
