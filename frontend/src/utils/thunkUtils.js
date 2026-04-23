/**
 * createAsyncThunk 的公共小工具
 * ------------------------------------------------------------------
 * 项目里每个 slice 都会写一份相同的：
 *   - axios 错误 → 字符串
 *   - 从 Redux state 判断是否登录
 * 抽出来之后，slice 之间不会因为复制粘贴走样。
 */

/**
 * 把 axios 错误对象转成简单字符串 —— 优先用后端返回的 message，
 * 没有就退回到 JS 原生的 err.message，最后兜底一个通用文案。
 */
export const extractError = (err) =>
  err?.response?.data?.message || err?.message || 'Something went wrong';

/**
 * 当前用户是否已登录 —— 从 Redux state.auth.token 推断。
 * 用 Boolean 显式转换，避免把 undefined 当成布尔值传下去。
 */
export const isUserLoggedIn = (state) => Boolean(state.auth.token);
