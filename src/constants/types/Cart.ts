import { ObjectIdCustom } from './common';

export type CartProductInput = {
  productId: ObjectIdCustom;
  shopId: ObjectIdCustom;
  quantity: number;
};
export type CartProduct = CartProductInput & {
  name: string;
  price: number;
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
  cartState: TCartState;
  cartUserId: ObjectIdCustom;
};

type TCartResponse = TCart & {
  _id: ObjectIdCustom;
  createdAt: Date;
  updatedAt: Date;
};

export { TCartResponse };
