import { Types } from 'mongoose';
export type CartProduct = {
  _id: Types.ObjectId | string;
  price: number;
  quantity: number;
};
type TCart = {
  _id: Types.ObjectId | string;
  productIds: CartProduct[];
  quantity: number;

  orderer: Types.ObjectId | string;
  phoneNumber: string;
  address: string;
  note: string;
  paymentMethod: string;
  paymentStatus: string;
  shippingStatus: string;
  shippingMethod: string;
  shippingFee: number;
  discountAmount: number;
  totalPrice: number;
  totalAmount: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};
export default TCart;
