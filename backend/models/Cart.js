import { Schema, model } from 'mongoose';

/**
 * 购物车（Cart）Schema
 * ------------------------------------------------------------------
 * 设计要点：
 *  - 每个登录用户只对应一份购物车（user 字段加 unique 索引，
 *    避免出现一人多车的脏数据）
 *  - items 是数组：每项只存 product 的 ObjectId 和 quantity，
 *    不冗余存单价 —— 单价以实时查询到的 Product 为准，
 *    这样商品涨价/降价时购物车自动同步
 *  - discountCode 保存当前已应用的优惠码（可能是空串）
 *  - 订单金额（小计/税费/总计）在读取时动态计算（见 cart controller），
 *    不入库，避免商品改价后金额错乱
 */
const CartItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product', // 关联 Product，populate 后可直接拿到商品完整信息
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'], // 最少 1 件，避免 0 件脏数据
      default: 1,
    },
  },
  { _id: false }, // 子文档不需要独立 _id，减少冗余字段
);

const CartSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // 一个用户只能有一份购物车
    },
    items: { type: [CartItemSchema], default: [] }, // 默认空数组，避免 undefined
    discountCode: { type: String, default: '' }, // 当前生效的优惠码
  },
  { timestamps: true }, // 自动加 createdAt / updatedAt
);

export default model('Cart', CartSchema);
