import { RequestHandler } from 'express';
import { OrderStatus } from 'src/constants/types/Order';
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
    ).required(),
    itemProducts: yupArray(
      yupObject({
        productId: isObjectId.required(),
        shopId: isObjectId.required(),
        quantity: Yup.number().required(),
      }),
    ).required(),
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

  static cancelOrderSchema = yupObject({
    query: yupObject({
      orderId: isObjectId.required(),
      cartId: isObjectId.required(),
      orderStatus: Yup.string().required(),
    }),
  });
  static cancelOrderByUser: RequestHandler = async (req, res) => {
    const { orderId, orderStatus, cartId } = req.query;
    const keyStored = getKeyStored(req);
    new OK({
      message: 'Canceled order successfully!',
      metadata: await OrderService.cancelOrderByUser({
        orderId: orderId as string,
        orderUserId: keyStored.user,
        cartId: cartId as string,
        orderStatus: orderStatus as string,
      }),
    }).send(res);
  };
  static updateStatusOrderSchema = yupObject({
    query: yupObject({
      orderId: isObjectId.required(),
      oldStatus: Yup.string().required(),
      newStatus: Yup.string().required(),
    }),
  });
  static updateOrderStatusByShop: RequestHandler = async (req, res) => {
    const { orderId, oldStatus, newStatus } = req.query;
    const keyStored = getKeyStored(req);
    new OK({
      message: 'Changed order status successfully!',
      metadata: await OrderService.updateOrderStatusByShop({
        orderId: orderId as string,
        orderUserId: keyStored.user,
        oldStatus: oldStatus as OrderStatus,
        newStatus: newStatus as OrderStatus,
      }),
    }).send(res);
  };
}

export default OrderController;
