/**
 * 价格计算公共模块
 * ------------------------------------------------------------------
 * 购物车（cart）和订单（order）共用这一份：
 *   - 税率 TAX_RATE
 *   - 促销码表 PROMO_CODES
 *   - 金额计算 computeAmounts(items, discountCode)
 *
 * 之前两个控制器各自写了一遍完全一样的逻辑，任何调整都得改两处
 * 还容易对不上账。抽出来之后，只要一份真相。
 */

/**
 * 可用优惠码表（demo 用，生产环境应该放到独立集合里 + 后台管理界面）
 *   - fixed:   固定减免金额（不会让小计变成负数）
 *   - percent: 按比例打折（0.1 = 10% off）
 */
export const PROMO_CODES = {
  '20 DOLLAR OFF': { type: 'fixed', value: 20 },
  WELCOME10: { type: 'percent', value: 0.1 },
  TAKE5: { type: 'percent', value: 0.05 },
};

/**
 * 税率（10%）—— 跟结算页 UI 里写的税率保持一致
 */
export const TAX_RATE = 0.1;

/**
 * 根据"{ price, quantity }[]"形式的条目 + 当前促销码，算出 subtotal / tax /
 * discount / total 四个数字（全部服务端计算、全部 toFixed(2) 修复浮点误差）。
 *
 * 调用方负责把自己的数据结构映射成 { price, quantity }：
 *   - cart controller: 价格来自 populate 之后的 Product（可能被 null 掉）
 *   - order controller: 价格是下单时快照，永远非空
 */
export const computeAmounts = (items, discountCode = '') => {
  // 小计 = Σ(单价 × 数量)；价格缺失时按 0 计，防御性处理
  const subtotal = items.reduce(
    (sum, it) => sum + (it.price || 0) * it.quantity,
    0,
  );
  const tax = +(subtotal * TAX_RATE).toFixed(2);

  // 折扣：fixed 要做 min 截断，避免小计被打成负数
  let discount = 0;
  const promo = PROMO_CODES[discountCode];
  if (promo) {
    discount =
      promo.type === 'fixed'
        ? Math.min(promo.value, subtotal)
        : +(subtotal * promo.value).toFixed(2);
  }

  const total = +(subtotal + tax - discount).toFixed(2);

  return {
    subtotal: +subtotal.toFixed(2),
    tax,
    discount,
    total,
  };
};
