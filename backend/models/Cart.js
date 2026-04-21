import { Schema, model } from 'mongoose';

const CartItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product', 
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'], 
      default: 1,
    },
  },
  { _id: false }, 
);

const CartSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: { type: [CartItemSchema], default: [] }, 
    discountCode: { type: String, default: '' },
  },
  { timestamps: true }, 
);

export default model('Cart', CartSchema);
