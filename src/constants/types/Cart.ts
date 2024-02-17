import { Types } from 'mongoose';

export type CartProductInput = {
  productId: Types.ObjectId | string;
  shopId: Types.ObjectId | string;
  quantity: number;
};
export type CartProduct = {
  productId: Types.ObjectId | string;
  shopId: Types.ObjectId | string;
  name: string;
  price: number;
  quantity: number;
};
export type TCartState = 'pending' | 'active' | 'completed' | 'failed';
export type UpdateCartPayload = {
  cartId: string;
  productId: string;
  quantity: number;
  oldQuantity: number;
  version: number;
};
type TCart = {
  cartProducts: CartProduct[];
  cartCountProducts: number;
  cartState: TCartState | string;
  cartUserId: Types.ObjectId | string;
};

type TCartResponse = TCart & {
  _id: Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
};

export { TCart, TCartResponse };
