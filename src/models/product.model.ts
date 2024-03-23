import mongoose, { Schema } from 'mongoose';
import slugify from 'slugify';
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
      default: 0,
    },
    productDescription: { type: String },
    productSlug: { type: String, default: null },
    productType: {
      type: String,
      required: true,
      enums: productType,
    },
    productAttributes: {
      type: Schema.Types.Mixed,
      required: true,
    },
    productRatingAverage: {
      type: Number,
      default: 5,
      min: [0, 'Rating must be at least 0'],
      max: [5, 'Rating must can not be more than 5'],
      set: (value: number) => Math.round(value * 10) / 10,
    },
    productVariations: {
      type: Array,
      default: [],
    },
    isDraft: {
      type: Boolean,
      default: true,
      index: true,
      select: false,
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
      select: false,
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
// index for search
productSchema.index({
  productName: 'text',
  productDescription: 'text',
});

// ENCRYPTION
productSchema.pre('save', async function (next) {
  if (this.isModified('productName')) {
    this.productSlug = slugify(this.productName, { lower: true });
  }
  next();
});
productSchema.virtual('productInventory', {
  ref: DOCUMENT_NAMES.INVENTORY,
  localField: '_id',
  foreignField: 'invenProductId',
  justOne: true,
});

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
