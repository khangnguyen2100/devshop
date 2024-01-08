import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import { COLLECTION_NAMES, DOCUMENT_NAMES } from 'src/constants/enums/common';

const shopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      maxLength: 150,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate: [validator.isEmail, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: true,
      minLength: [6, 'Your password must be at least 6 characters long'],
      select: false, //dont send back password after request
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'inactive',
    },
    verify: {
      type: Boolean,
      default: false,
    },
    roles: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAMES.SHOP,
  },
);

// ENCRYPTION
shopSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export default mongoose.model(DOCUMENT_NAMES.SHOP, shopSchema);
