import { ObjectId } from 'mongoose';

import { CartProduct, CartProductInput } from './Cart';
import { MongoTimestamps } from './common';

export type TShopDiscount = {
  shopId: string;
  code: string;
  discountId: string;
};

export type TOrderData = {
  shopId: string;
  shopDiscounts: TShopDiscount[];
  itemProducts: CartProductInput[];
};

type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'canceled'
  | 'shipped'
  | 'completed';

type PaymentMethod = 'CASH' | 'ONLINE';
type ShippingAddress = {
  provinceCode: string;
  provinceName: string;
  districtCode: string;
  districtName: string;
  wardCode: string;
  wardName: string;
  streetName: string;
  addressDetail: string;
};
type OrderCheckoutPrices = {
  totalPrice: number;
  totalFeeShip: number;
  totalDiscount: number;
  finalPrice: number;
};

type TOrderBase = {
  orderUserId: string | ObjectId;
  orderProducts: CartProduct[]or

export {
  TOrderInput,
  TOrderResponse,
  ShippingAddress,
  OrderStatus,
  PaymentMethod,
};
