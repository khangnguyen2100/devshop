import mongoose, { Schema } from 'mongoose';
import { COLLECTION_NAMES, DOCUMENT_NAMES } from 'src/constants/enums/common';
import { TProductType } from 'src/constants/types/Product';

export const productType: TProductType[] = [
  'clothing',
  'electronic',
  'furniture',
];

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
    },
    productThumb: {
      type: String,
      required: true,
    },
    productPrice: {
      type: Number,
      required: true,
    },
    productQuantity: {
      type: Number,
      required: true,
    },
    productDescription: {
      type: String,
    },
    productType: {
      type: String,
      required: true,
      enums: productType,
    },
    productAttributes: {
      type: Schema.Types.Mixed,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: DOCUMENT_NAMES.SHOP,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAMES.PRODUCT,
  },
);

const clothingSchema = new mongoose.Schema(
  {
    brand: {
      type: String,
      required: true,
    },
    size: String,
    material: String,
  },
  {
    timestamps: true,
    collection: 'Clothes',
  },
);
const electronicSchema = new mongoose.Schema(
  {
    manufacturer: {
      type: String,
      required: true,
    },
    modal: String,
    color: String,
  },
  {
    timestamps: true,
    collection: 'Electronics',
  },
);
export const clothingModel = mongoose.model('clothing', clothingSchema);
export const electronicModel = mongoose.model('electronic', electronicSchema);

export default mongoose.model(DOCUMENT_NAMES.PRODUCT, productSchema);
