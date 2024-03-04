import dayjs from 'dayjs';
import mongoose, { Schema } from 'mongoose';
import { COLLECTION_NAMES, DOCUMENT_NAMES } from 'src/constants/enums/common';

const orderSchema = new mongoose.Schema(
  {
    orderUserId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: DOCUMENT_NAMES.SHOP,
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'canceled', 'shipped', 'completed'],
      default: 'pending',
    },
    /**
     @type CartProduct
    */
    orderProducts: {
      type: Array,
      default: [],
      require: true,
    },
    orderCheckoutPrices: {
      type: Object,
    },
    /**
     @type ShippingAddress
    */
    orderShippingAddress: {
      type: Object,
      default: {},
    },
    /**
     @type PaymentMethod
    */
    orderPaymentMethod: {
      type: String,
      enum: ['CASH', 'ONLINE'],
    },
    orderTrackingNumber: {
      type: String,
      default: `#SHIPPING_CODE_${dayjs().format('DD.MM.YYYY')}`,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAMES.ORDER,
  },
);

export default mongoose.model(DOCUMENT_NAMES.ORDER, orderSchema);
