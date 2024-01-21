import mongoose, { Schema } from 'mongoose';
import { COLLECTION_NAMES, DOCUMENT_NAMES } from 'src/constants/enums/common';

const inventorySchema = new mongoose.Schema(
  {
    invenProductId: {
      type: Schema.Types.ObjectId,
      ref: DOCUMENT_NAMES.PRODUCT,
    },
    invenStock: {
      type: Number,
      required: true,
    },
    invenLocation: {
      type: String,
      default: 'unKnown',
    },
    invenShopId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: DOCUMENT_NAMES.SHOP,
    },
    invenReservations: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAMES.INVENTORY,
  },
);

export default mongoose.model(DOCUMENT_NAMES.INVENTORY, inventorySchema);
