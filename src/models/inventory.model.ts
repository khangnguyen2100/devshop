import mongoose, { Schema } from 'mongoose';
import { COLLECTION_NAMES, DOCUMENT_NAMES } from 'src/constants/enums/common';
import { BadRequestError } from 'src/helpers/core/error.response';
import { convertToObjectId } from 'src/utils/common';
import TInventory from 'src/constants/types/Inventory';

import productModel from './product.model';

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

inventorySchema.pre('save', async function (next) {
  if (this.isModified('invenStock')) {
    const product = await productModel.findOne({
      _id: convertToObjectId(this.invenProductId?.toString() || ''),
      createdBy: convertToObjectId(this.invenShopId?.toString() || ''),
    });
    if (!product) {
      throw new BadRequestError(
        'Update inventory failed. Product is not found.',
      );
    }
    product.productQuantity = this.invenStock;
    await product.save();
  }
  next();
});
inventorySchema.pre('updateOne', async function (next) {
  const updatedData = this.getUpdate() as TInventory;
  if (updatedData.invenStock) {
    const product = await productModel.findOne({
      _id: convertToObjectId(updatedData.invenProductId),
      createdBy: convertToObjectId(updatedData.invenShopId),
    });
    if (!product) {
      throw new BadRequestError(
        'Update inventory failed. Product is not found.',
      );
    }
    product.productQuantity = updatedData.invenStock;
    await product.save();
  }
  next();
});

export default mongoose.model(DOCUMENT_NAMES.INVENTORY, inventorySchema);
