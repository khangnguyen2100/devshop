import { RequestHandler } from 'express';
import { OK } from 'src/helpers/core/success.response';
import OrderService from 'src/services/order.service';
import getKeyStored from 'src/utils/getKeyStored';

class OrderController {
  static getCheckoutReview: RequestHandler = async (req, res) => {
    const keyStored = getKeyStored(req);
    new OK({
      message: 'Get data successfully!',
      metadata: await OrderService.getCheckoutReview({
        userId: keyStored.user,
        orderData: req.body,
      }),
    }).send(res);
  };
  static orderByUser: RequestHandler = async (req, res) => {
    const { cartId } = req.params;
    const keyStored = getKeyStored(req);

    const body = req.body;
    new OK({
      message: 'Get data successfully!',
      metadata: await OrderService.orderByUser({
        userId: keyStored.user,

        orderData: req.body.orderData,
        cartId: cartId,
        paymentMethod: body.paymentMethod,
        userAddress: body.userAddress,
      }),
    }).send(res);
  };
}

export default OrderController;
