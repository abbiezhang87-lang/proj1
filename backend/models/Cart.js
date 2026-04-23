import { Schema, model } from 'mongoose';

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
