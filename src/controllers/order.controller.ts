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
}

export default OrderController;
