import { Schema, model } from 'mongoose';

/**
 * 订单（Order）Schema —— 额外功能（Order History）
 * ------------------------------------------------------------------
 * 设计要点：
 *  - 跟 Cart 不一样：订单里的商品必须"快照"落盘（name / price / imageUrl
 *    全部写死），这样以后商品涨价、改名、甚至被删了，
 *    历史订单展示的还是下单时的真实数据
 *  - 金额字段（subtotal / tax / discount / total）也一并落盘，
 *    避免之后重新计算对不上账
 *  - user 加索引 —— 查"我的订单"时按 user + createdAt 排序，很常见
 *  - status 目前只有 'placed'，后续要做发货/收货流程再加枚举
 */
const OrderItemSchema = new Schema(
  {
    // 仍然保留 product 引用，方便"再次购买"之类的二次跳转；
    // 商品被删了 ref 会查不到，但下方的快照字段还能渲染
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
    },
    // 下面 4 个字段都是下单时刻的快照
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, default: '' },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
    },
  },
  { _id: false },
);

const OrderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // 按用户查历史订单很高频
    },
    items: { type: [OrderItemSchema], required: true },

    // 金额快照（全部服务端计算好再写入）
    subtotal: { type: Number, required: true, min: 0 },
    tax: { type: Number, required: true, min: 0 },
    discount: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },
    discountCode: { type: String, default: '' },

    // 订单状态：目前只有"已下单"，预留扩展位
    status: {
      type: String,
      enum: ['placed', 'shipped', 'delivered', 'cancelled'],
      default: 'placed',
    },
  },
  { timestamps: true }, // createdAt 就是下单时间
);

export default model('Order', OrderSchema);
