import { TOrderInput } from 'src/constants/types/Order';

import orderModel from '../order.model';

const createOrder = async (props: TOrderInput) => {
  const {
    orderCheckoutPrices,
    orderPaymentMethod,
    orderProducts,
    orderShippingAddress,
    orderUserId,
  } = props;
  const result = await orderModel.create({
    orderUserId,
    orderProducts,
    orderCheckoutPrices,
    orderShippingAddress,
    orderPaymentMethod,
  });
  return result;
};
export { createOrder };
