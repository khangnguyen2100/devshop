import { CartProductInput } from './Cart';

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
type OrderStatus = 'pending' | 'completed' | 'failed';

type TOrder = {
  cartId: string;
  userId: string;
  paymentMethod: string;
  status: OrderStatus;
  orderData: TOrderData[];
  totalPrice: number;
  totalFeeShip: number;
  totalDiscount: number;
  finalPrice: number;
};
export default TOrder;
