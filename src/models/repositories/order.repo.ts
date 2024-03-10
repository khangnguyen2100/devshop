import { TOrderInput } from 'src/constants/types/Order';
import { ClientSession } from 'mongoose';

import orderModel from '../order.model';

const createOrder = async (props: TOrderInput, session: ClientSession) => {
  const {
    orderCheckoutPrices,
    orderPaymentMethod,
    orderProducts,
    orderShippingAddress,
    orderUserId,
  } = props;
  const result = await orderModel.create(
    {
      orderUserId,
      orderProducts,
      orderCheckoutPrices,
      orderShippingAddress,
      orderPaymentMethod,
    },
    { session },
  );
  return result;
};
export { createOrder };
