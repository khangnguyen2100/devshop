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
    model: String,
    color: String,
  },
  {
    timestamps: true,
    collection: 'Electronics',
  },
);
const furnitureSchema = new mongoose.Schema(
  {
    manufacturer: {
      type: String,
      required: true,
    },
    model: String,
    material: String,
  },
  {
    timestamps: true,
    collection: 'Furnitures',
  },
);

const productModel = mongoose.model(DOCUMENT_NAMES.PRODUCT, productSchema);

const clothingModel = mongoose.model('Clothing', clothingSchema);
const electronicModel = mongoose.model('Electronic', electronicSchema);
const furnitureModel = mongoose.model('Furniture', furnitureSchema);

export { clothingModel, electronicModel, furnitureModel };
export default productModel;
