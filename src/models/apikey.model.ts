import mongoose from 'mongoose';
import { COLLECTION_NAMES, DOCUMENT_NAMES } from 'src/constants/enums/common';

const apiKeySchema = new mongoose.Schema(
  {
    key: {
      type: String,
      unique: true,
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
    permissions: {
      type: [String],
      required: true,
      default: ['001', '002', '003'],
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAMES.APIKEY,
  },
);

export default mongoose.model(DOCUMENT_NAMES.APIKEY, apiKeySchema);
