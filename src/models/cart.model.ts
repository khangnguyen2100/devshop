import mongoose, { Schema } from 'mongoose';
import { COLLECTION_NAMES, DOCUMENT_NAMES } from 'src/constants/enums/common';
import { CartProduct } from 'src/constants/types/Cart';

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
cartSchema.post('findOne', async function (doc, next) {
  if (doc) {
    doc.cartCountProducts = doc.cartProducts.reduce(
      (arr: number, curr: CartProduct) => {
        return arr + curr.quantity;
      },
      0,
    );
    next();
  }
});
cartSchema.post('findOneAndUpdate', async function (doc) {
  if (doc) {
    doc.cartCountProducts = doc.cartProducts.reduce(
      (arr: number, curr: CartProduct) => {
        return arr + curr.quantity;
      },
      0,
    );
    await doc.save();
  }
});

export default mongoose.model(DOCUMENT_NAMES.CART, cartSchema);
