import mongoose, { Schema } from 'mongoose';
import { COLLECTION_NAMES, DOCUMENT_NAMES } from 'src/constants/enums/common';

const cartSchema = new mongoose.Schema(
  {
    cartState: {
      type: String,
      enum: ['pending', 'active', 'completed', 'failed'],
      default: 'active',
    },
    /*
      [
        {
          productId: Types.ObjectId,
          shopId: Types.ObjectId,
          name: string,
          quantity: number,
          price: number,
        }
      ]
    */
    cartProducts: {
      type: Array,
      default: [],
      require: true,
    },
    cartCountProducts: {
      type: Number,
      default: 0,
    },
    cartUserId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: DOCUMENT_NAMES.SHOP,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAMES.CART,
  },
);
cartSchema.pre('save', async function (next) {
  if (this.isModified('cartProducts')) {
    this.cartCountProducts = this.cartProducts.reduce((arr, curr) => {
      return arr + curr.quantity;
    }, 0);
  }
  next();
});

export default mongoose.model(DOCUMENT_NAMES.CART, cartSchema);
