import { RequestHandler } from 'express';
import { OK } from 'src/helpers/core/success.response';
import OrderService from 'src/services/order.service';
import getKeyStored from 'src/utils/getKeyStored';
import { isObjectId, yupArray, yupObject } from 'src/utils/validate';
import * as Yup from 'yup';

const orderDataSchema = yupArray(
  yupObject({
    shopId: isObjectId.required(),
    shopDiscounts: yupArray(
      yupObject({
        shopId: isObjectId.required(),
        code: Yup.string().required(),
        discountId: isObjectId.required(),
      }),
    ),
    itemProducts: yupArray(
      yupObject({
        productId: isObjectId.required(),
        shopId: isObjectId.required(),
        quantity: Yup.number().required(),
      }),
    ),
  }),
).required();
class OrderController {
  static getCheckoutReviewSchema = yupObject({
    body: orderDataSchema,
  });
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

  static orderByUserSchema = yupObject({
    params: yupObject({
      cartId: isObjectId.required(),
    }),
    body: yupObject({
      orderData: orderDataSchema,
      paymentMethod: Yup.string().required(),
      userAddress: Yup.string().required(),
    }),
  });
  static orderByUser: RequestHandler = async (req, res) => {
    const { cartId } = req.params;
    const keyStored = getKeyStored(req);
    console.log('req.body:', req.body)

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
