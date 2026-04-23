import { Schema, model } from 'mongoose';
import validator from 'validator';

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

ProductSchema.pre('save', function () {
  if (this.name) this.name = this.name.trim();
  if (this.description) this.description = this.description.trim();
  if (this.category) this.category = this.category.trim();
});


ProductSchema.methods.isAvailable = function () {
  return this.inStockQuantity > 0;
};

export default model('Product', ProductSchema);
