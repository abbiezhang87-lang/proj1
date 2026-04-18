import Cart from '../models/Cart.js';
import Product from '../models/product.js';

/**
 * 购物车控制器（cart controller）
 * ------------------------------------------------------------------
 * 关键设计：
 *  - 金额（小计/税/折扣/总计）一律在读取时由服务端即时计算，
 *    不入库 —— 这样商品改价后购物车自动同步，不用跑脚本补数据
 *  - 每个接口返回的都是 buildCartPayload 生成的"标准化购物车"，
 *    前端只需要一种渲染逻辑
 *  - getOrCreateCart 保证接口幂等：第一次访问自动创建空车
 */

/**
 * 可用优惠码表（demo 用，生产环境应该放到独立集合里 + 后台管理界面）
 *   - fixed:  固定减免金额（不会让小计变成负数）
 *   - percent: 按比例打折（0.1 = 10% off）
 */
const PROMO_CODES = {
  '20 DOLLAR OFF': { type: 'fixed', value: 20 },
  WELCOME10: { type: 'percent', value: 0.1 },
};

/**
 * 税率（10%）—— 跟结算页 UI 里写的税率保持一致
 */
const TAX_RATE = 0.1;

/**
 * 把 Cart 文档转成给前端的标准 payload：
 *  - items: 带完整商品信息（已 populate）
 *  - subtotal / tax / discount / total: 服务端即时算好
 *
 * 注意所有金额都 toFixed(2) 再 +  —— 解决 JS 浮点精度，
 * 例如 0.1 + 0.2 = 0.30000000000000004 的经典坑
 */
const buildCartPayload = (cart) => {
  const items = cart.items.map((it) => ({
    product: it.product,
    quantity: it.quantity,
  }));

  // 小计 = Σ(单价 × 数量)；product 可能为 null（商品被删除了），此时按 0 计
  const subtotal = items.reduce(
    (sum, it) => sum + (it.product?.price || 0) * it.quantity,
    0,
  );
  const tax = +(subtotal * TAX_RATE).toFixed(2);

  // 折扣计算：fixed 要做 min 截断，避免小计被打成负数
  let discount = 0;
  const promo = PROMO_CODES[cart.discountCode];
  if (promo) {
    discount =
      promo.type === 'fixed'
        ? Math.min(promo.value, subtotal)
        : +(subtotal * promo.value).toFixed(2);
  }

  const total = +(subtotal + tax - discount).toFixed(2);

  return {
    items,
    discountCode: cart.discountCode || '',
    subtotal: +subtotal.toFixed(2),
    tax,
    discount,
    total,
  };
};

/**
 * 保证用户一定有购物车：
 *  - 找得到就直接用
 *  - 找不到就建一个空的
 * populate('items.product') 把商品详情一次性拉出来，
 * 前端就能直接用 name / price / imageUrl 渲染
 */
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
    cart = await cart.populate('items.product');
  }
  return cart;
};

/**
 * GET /api/cart
 * 获取当前用户的购物车（不存在就自动创建空车）
 */
export const getCart = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    res.json(buildCartPayload(cart));
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/cart/items
 * Body: { productId, quantity? }，quantity 默认 1
 *
 * 如果商品已经在车里，叠加数量；否则 push 新项。
 * 这里没做库存校验 —— 只要下单结算那一步再校验就行，
 * 这样可以允许"先加到车里等一等再买"的体验。
 */
export const addItem = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) {
      return res.status(400).json({ message: 'productId is required' });
    }
    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    // 校验商品存在 —— 避免有人用伪造的 productId 污染购物车
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const cart = await getOrCreateCart(req.user._id);
    const existing = cart.items.find(
      (it) => it.product._id.toString() === productId,
    );
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }
    await cart.save();

    // 重新 populate 一次拿到新添加的商品详情
    const fresh = await Cart.findById(cart._id).populate('items.product');
    res.json(buildCartPayload(fresh));
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/cart/items/:productId
 * Body: { quantity }
 *
 * 设置某个商品的数量：
 *  - quantity > 0 → 直接覆盖旧数量
 *  - quantity = 0 → 从购物车里删除该商品（体验上相当于减到 0）
 *  - quantity < 0 → 400
 */
export const updateItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    if (quantity == null || quantity < 0) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }

    const cart = await getOrCreateCart(req.user._id);
    const idx = cart.items.findIndex(
      (it) => it.product._id.toString() === productId,
    );
    if (idx === -1) {
      return res.status(404).json({ message: 'Item not in cart' });
    }

    if (quantity === 0) {
      cart.items.splice(idx, 1);
    } else {
      cart.items[idx].quantity = quantity;
    }
    await cart.save();

    const fresh = await Cart.findById(cart._id).populate('items.product');
    res.json(buildCartPayload(fresh));
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/cart/items/:productId
 * 从购物车里移除某个商品（无论当前数量是多少）
 */
export const removeItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const cart = await getOrCreateCart(req.user._id);
    cart.items = cart.items.filter(
      (it) => it.product._id.toString() !== productId,
    );
    await cart.save();

    const fresh = await Cart.findById(cart._id).populate('items.product');
    res.json(buildCartPayload(fresh));
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/cart/promo
 * Body: { code }
 *
 * 应用优惠码。trim + upper 后再查表，这样用户输小写/带空格也没关系。
 * 无效码直接 400 —— 把错误前置到加码时，而不是结算时才报错。
 */
export const applyPromo = async (req, res, next) => {
  try {
    const code = (req.body.code || '').trim().toUpperCase();
    if (!code) {
      return res.status(400).json({ message: 'Promo code is required' });
    }
    if (!PROMO_CODES[code]) {
      return res.status(400).json({ message: 'Invalid promotion code' });
    }

    const cart = await getOrCreateCart(req.user._id);
    cart.discountCode = code;
    await cart.save();

    const fresh = await Cart.findById(cart._id).populate('items.product');
    res.json(buildCartPayload(fresh));
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/cart
 * 清空购物车（结算完成后前端会调这个接口）
 * 顺便把 discountCode 一起清掉，防止下次下单还沿用上次的券
 */
export const clearCart = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    cart.items = [];
    cart.discountCode = '';
    await cart.save();

    const fresh = await Cart.findById(cart._id).populate('items.product');
    res.json(buildCartPayload(fresh));
  } catch (err) {
    next(err);
  }
};
