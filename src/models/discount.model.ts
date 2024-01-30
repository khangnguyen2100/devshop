import mongoose, { Schema } from 'mongoose';
import { COLLECTION_NAMES, DOCUMENT_NAMES } from 'src/constants/enums/common';
import {
  discountAppliesToType,
  discountType,
} from 'src/constants/enums/product';

const discountSchema = new mongoose.Schema(
  {
    // info
    discountName: { type: String, required: true },
    discountCode: {
      type: String,
      required: true,
      readonly: true,
    },
    discountDescription: { type: String, default: '' },
    discountMaxUses: { type: Number, required: true }, // times this discount can be used
    discountUsesCount: { type: Number, default: 0 }, // times this discount has been used
    discountUsersUsed: { type: Array, default: [] }, // who used this discount
    discountMaxUsesPerUser: { type: Number, required: true }, // how many times a user can use this discount
    discountMinOrderValue: { type: Number, required: true }, // min price to use this discount
    discountIsActive: { type: Boolean, default: true },

    // value and type
    discountType: {
      type: String,
      required: true,
      enums: discountType,
    },
    /**
     * fixed amount: 100$ => 100
     * percentage: 10% => 10
     */
    discountValue: { type: Number, required: true },
    discountAppliesTo: {
      type: String,
      required: true,
      enums: discountAppliesToType,
    },

    // date
    discountStartDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    discountEndDate: {
      type: Date,
      required: true,
    },

    // ref
    discountShopId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: DOCUMENT_NAMES.SHOP,
    },
    discountProductsId: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAMES.DISCOUNT,
  },
);

export default mongoose.model(DOCUMENT_NAMES.DISCOUNT, discountSchema);
