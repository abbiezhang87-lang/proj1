import { Schema, model } from 'mongoose';
import validator from 'validator';

/**
 * 商品（Product）Schema
 * ------------------------------------------------------------------
 * 字段对应 Figma 里的 create-product 表单：
 *   name            商品名
 *   description     商品描述
 *   category        分类
 *   price           单价（必须 ≥ 0）
 *   inStockQuantity 库存数量（必须 ≥ 0）
 *   imageUrl        图片 URL（必须是 http/https 开头的合法 URL）
 *
 * 所有字段都在 Schema 层加了 required + 范围校验：
 * 非法数据进入时会抛 ValidationError，交给全局 errorHandler
 * 中间件转成 400 响应（而不是 500）。
 */
const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a product name'],
      trim: true,
      maxlength: [120, 'Product name cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a product description'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
      min: [0, 'Price must be greater than or equal to 0'],
    },
    inStockQuantity: {
      type: Number,
      required: [true, 'Please add the stock quantity'],
      min: [0, 'Stock quantity must be greater than or equal to 0'],
      default: 0,
    },
    imageUrl: {
      type: String,
      required: [true, 'Please add an image URL'],
      // 自定义校验器：必须是合法的 http/https URL
      validate: {
        validator: (v) =>
          validator.isURL(v, {
            protocols: ['http', 'https'],
            require_protocol: true,
          }),
        message: 'Please provide a valid image URL',
      },
    },
  },
  { timestamps: true }, // 自动加 createdAt / updatedAt
);

/**
 * 保存前钩子：去除首尾空格，避免因为用户多按了空格导致搜索不到
 * 起初以为 function (next)这种非async写法不受影响，
+   实际测试下来 product.js 也炸了同样的 "next is not a function"。
+   再读一遍 kareem/index.js 的 execPre 源码（行 57–65）：
+     for (let i = 1; i < _args.length; ++i) {
+       if (i === _args.length - 1 && typeof _args[i] === 'function') {
+         continue; // skip callbacks
+       }
+       args.push(_args[i]);
+     }
+   这段逻辑对所有pre 钩子一视同仁，不区分 async / 普通 function。
+   结论：不管是不是 async，都不要再写 next。
 */
ProductSchema.pre('save', function () {
  if (this.name) this.name = this.name.trim();
  if (this.description) this.description = this.description.trim();
  if (this.category) this.category = this.category.trim();
});

/**
 * 实例方法：是否还有库存
 */
ProductSchema.methods.isAvailable = function () {
  return this.inStockQuantity > 0;
};

export default model('Product', ProductSchema);
