import { OrderStatus, TOrderInput } from 'src/constants/types/Order';
import { ClientSession } from 'mongoose';
import { convertToObjectId } from 'src/utils/common';

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
    [
      {
        orderUserId,
        orderProducts,
        orderCheckoutPrices,
        orderShippingAddress,
        orderPaymentMethod,
      },
    ],
    { session },
  );
  return result;
};
const changeOrderStatus = async (props: {
  orderId: string;
  orderUserId: string;
  newStatus: OrderStatus;
  oldStatus: OrderStatus;
  session: ClientSession;
}) => {
  const { newStatus, oldStatus, orderId, orderUserId, session } = props;
  const result = await orderModel.findOneAndUpdate(
    {
      _id: convertToObjectId(orderId),
      orderUserId: convertToObjectId(orderUserId),
      orderStatus: oldStatus,
    },
    { orderStatus: newStatus },
    { session, new: true },
  );
  return result;
};

const findOrderById = async (orderId: string) => {
  const result = await orderModel.findById(convertToObjectId(orderId));
  return result;
};
export { createOrder, changeOrderStatus, findOrderById };
