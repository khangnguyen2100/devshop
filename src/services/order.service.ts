import mongoose from 'mongoose';
import { orderStatus, orderStatusColorMap } from 'src/constants/enums/Order';
import { CartProduct } from 'src/constants/types/Cart';
import {
  OrderStatus,
  PaymentMethod,
  ShippingAddress,
  TOrderData,
} from 'src/constants/types/Order';
import { BadRequestError } from 'src/helpers/core/error.response';
import {
  findCartByUserId,
  getCartProductsData,
} from 'src/models/repositories/cart.repo';
import { checkIsEnoughQuantity } from 'src/models/repositories/inventory.repo';
import {
  changeOrderStatus,
  createOrder,
  findOrderById,
} from 'src/models/repositories/order.repo';
import { formatNumber } from 'src/utils/number';
import { sendOrderLogMessage } from 'src/middleware/logger';

import DiscountService from './discount.service';
import {
  acquireLockCancelOrder,
  acquireLockCartReservation,
  releaseLock,
} from './redis.service';

type OrderByUserProps = {
  userAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  cartId: string;
  userId: string;
  orderData: TOrderData[];
};

const FREE_SHIP_PRICE = 30000; // 30k
const handleCheckBeforeChangeOrderStatus = (
  oldStatus: OrderStatus,
  newStatus: OrderStatus,
) => {
  // check is change status valid
  const { PENDING, CONFIRMED, CANCELED, SHIPPED, COMPLETED } = orderStatus;
  if (
    oldStatus === PENDING &&
    (newStatus === CANCELED || newStatus === CONFIRMED)
  ) {
    return;
  }
  if (oldStatus === CONFIRMED && newStatus === SHIPPED) {
    return;
  }
  if (oldStatus === SHIPPED && newStatus === COMPLETED) {
    return;
  }
  throw new BadRequestError(
    `You cannot update status from ${oldStatus} to ${newStatus}.`,
  );
};

class OrderService {
  static async getCheckoutReview({
    userId,
    orderData,
  }: {
    userId: string;
    orderData: TOrderData[];
  }) {
    const foundCart = await findCartByUserId(userId);
    if (!foundCart) {
      throw new BadRequestError('Cart not found!');
    }
    const totalOrderReview = {
      totalPrice: 0,
      totalFeeShip: 0,
      totalDiscount: 0,
      finalPrice: 0,
    };
    const orderReviews = [];
    for (let i = 0; i < orderData.length; i++) {
      const orderReviewItem = {
        totalPrice: 0,
        totalFeeShip: 30000,
        totalDiscount: 0,
        finalPrice: 0,
        shopDiscounts: [],
        itemProducts: [] as CartProduct[],
      };
      const { itemProducts, shopDiscounts } = orderData[i];
      const cartProductsData = await getCartProductsData(itemProducts);

      // calc total price
      const totalPrice = cartProductsData.reduce((arr, curr) => {
        return arr + curr.price * curr.quantity;
      }, 0);
      orderReviewItem.totalPrice = totalPrice;
      orderReviewItem.itemProducts = cartProductsData;

      totalOrderReview.totalPrice += totalPrice;
      totalOrderReview.totalFeeShip += FREE_SHIP_PRICE;

      // calc discount value
      if (shopDiscounts.length > 0) {
        // get total discounts price
        const discountAmounts = await Promise.all(
          shopDiscounts.map(async item => {
            return await DiscountService.getDiscountAmountByUser({
              discountCode: item.code,
              userId: userId,
              shopId: item.shopId,
              cartProducts: cartProductsData,
            });
          }),
        );
        const totalDiscountAmount = discountAmounts.reduce((arr, curr) => {
          return arr + curr.discountPrice;
        }, 0);

        orderReviewItem.totalDiscount = totalDiscountAmount;
        orderReviewItem.shopDiscounts = discountAmounts as never[];
        totalOrderReview.totalDiscount += totalDiscountAmount;
      }
      orderReviewItem.finalPrice =
        orderReviewItem.totalPrice -
        orderReviewItem.totalDiscount +
        orderReviewItem.totalFeeShip;
      totalOrderReview.finalPrice +=
        orderReviewItem.totalPrice -
        orderReviewItem.totalDiscount +
        orderReviewItem.totalFeeShip;
      orderReviews.push(orderReviewItem);
    }
    return {
      orderReviewDetail: orderReviews,
      prices: totalOrderReview,
    };
  }
  static async handleProductsIsEnoughQuantity(products: CartProduct[]) {
    return await Promise.all(
      products.map(async item => {
        const isEnough = await checkIsEnoughQuantity({
          productId: item.productId.toString(),
          quantity: item.quantity,
        });
        return isEnough;
      }),
    ).then(result => {
      return result.every(item => item === true);
    });
  }
  static async orderByUser(props: OrderByUserProps) {
    const { cartId, orderData, paymentMethod, userAddress, userId } = props;
    const { orderReviewDetail, prices } = await this.getCheckoutReview({
      orderData,
      userId,
    });
    const products = orderReviewDetail.flatMap(item => item.itemProducts);

    // check product is enough quantity before start order
    const isEnoughQuantity =
      await this.handleProductsIsEnoughQuantity(products);

    if (!isEnoughQuantity) {
      throw new BadRequestError(
        'Some products are not enough quantity, please refresh your cart and try again!',
      );
    }

    // trừ hàng trong kho, đặt hàng
    const acquireProductKeyLock: (string | null)[] = [];

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      for (let i = 0; i < products.length; i++) {
        const { productId, quantity, shopId } = products[i];

        const keyLock = await acquireLockCartReservation({
          cartId,
          productId: productId.toString(),
          quantity,
          session,
        });
        acquireProductKeyLock.push(keyLock ? keyLock : null);
      }
      // check if any product is not enough quantity
      if (acquireProductKeyLock.includes(null)) {
        throw new BadRequestError('Some products are not enough quantity');
      }

      // create order
      const createdOrderSuccess = await createOrder(
        {
          orderUserId: userId,
          orderShippingAddress: userAddress,
          orderCheckoutPrices: prices,
          orderPaymentMethod: paymentMethod,
          orderProducts: products,
        },
        session,
      );
      const newOrder = createdOrderSuccess[0];
      if (createdOrderSuccess.length > 0 && newOrder) {
        // push notification
        const codeMessage = {
          embeds: [
            {
              color: parseInt(orderStatusColorMap['pending'], 16),
              title: `New Order: ${newOrder.orderTrackingNumber}!`,
              url: 'https://discord.js.org',
              description: `You have new order!`,
              fields: [
                {
                  name: 'Total Price',
                  value: `${formatNumber(
                    newOrder.orderCheckoutPrices.totalPrice,
                  )}`,
                  inline: true,
                },
                {
                  name: 'Discount Price',
                  value: `${formatNumber(
                    newOrder.orderCheckoutPrices.totalDiscount,
                  )}`,
                  inline: true,
                },
                {
                  name: 'Final Price',
                  value: `**${formatNumber(
                    newOrder.orderCheckoutPrices.finalPrice,
                  )}**`,
                },
                {
                  name: 'Shipping address',
                  value: newOrder.orderShippingAddress,
                  inline: true,
                },
              ],
            },
          ],
        };
        sendOrderLogMessage(codeMessage);
        await session.commitTransaction();
        return {
          orderReviewDetail,
          prices,
          products,
          createdOrder: newOrder,
        };
      } else {
        throw new Error('Create new order failed!');
      }
    } catch (error: any) {
      console.log('abortTransaction:');
      await session.abortTransaction();
      throw new BadRequestError(error.message);
    } finally {
      session.endSession();
      // release all locks, regardless of whether the transaction was successful
      for (const keyLock of acquireProductKeyLock) {
        if (keyLock) {
          await releaseLock(keyLock);
        }
      }
    }
  }

  static async getOrdersByUser() {}
  static async getOrderByUser() {}
  static async updateStatusByUser() {}
  static async cancelOrderByUser(props: {
    cartId: string;
    orderId: string;
    orderUserId: string;
    orderStatus: string;
  }) {
    const {
      cartId,
      orderId,
      orderUserId,
      orderStatus: currentOrderStatus,
    } = props;

    // find order
    const foundOrder = await findOrderById(orderId);
    if (!foundOrder) {
      throw new BadRequestError('Order not found!');
    }
    if (foundOrder.orderStatus !== currentOrderStatus) {
      throw new BadRequestError(
        'Order had been updated, Please re-load page and try again!',
      );
    }
    if (foundOrder.orderStatus !== orderStatus.PENDING) {
      throw new BadRequestError(
        'Sorry your order is confirmed, you can not cancel it. Please contact the shop.',
      );
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    const orderProducts = foundOrder.orderProducts as CartProduct[];
    const acquireProductKeyLock: (string | null)[] = [];
    // công lại số hàng đã trừ trong kho
    try {
      for (let i = 0; i < orderProducts.length; i++) {
        const { productId, quantity } = orderProducts[i];
        // remove product in cart
        const keyLock = await acquireLockCancelOrder({
          cartId,
          orderId,
          productId: productId.toString(),
          quantity,
          session,
        });
        acquireProductKeyLock.push(keyLock ? keyLock : null);
        console.log('keyLock:', keyLock);
      }
      // check if any product is not enough quantity
      if (acquireProductKeyLock.includes(null)) {
        throw new BadRequestError(
          'Some products are not found, Please try again!',
        );
      }

      // cancel order
      const canceledOrder = await changeOrderStatus({
        orderId,
        orderUserId,
        oldStatus: currentOrderStatus as OrderStatus,
        newStatus: orderStatus.CANCELED,
        session,
      });
      await session.commitTransaction();
      return canceledOrder;
    } catch (error: any) {
      await session.abortTransaction();
      throw new BadRequestError(error.message);
    } finally {
      session.endSession();
      // release all locks, regardless of whether the transaction was successful
      for (const keyLock of acquireProductKeyLock) {
        if (keyLock) {
          await releaseLock(keyLock);
        }
      }
    }
  }
  static async updateOrderStatusByShop(props: {
    orderId: string;
    orderUserId: string;
    oldStatus: OrderStatus;
    newStatus: OrderStatus;
  }) {
    const { orderId, orderUserId, oldStatus, newStatus } = props;
    handleCheckBeforeChangeOrderStatus(oldStatus, newStatus);

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const updatedOrder = await changeOrderStatus({
        orderId,
        orderUserId,
        oldStatus,
        newStatus,
        session,
      });

      if (updatedOrder) {
        // push notification
        const codeMessage = {
          embeds: [
            {
              color: parseInt(orderStatusColorMap[newStatus], 16),
              title: `Order: ${updatedOrder.orderTrackingNumber} status changed!`,
              description: `From: **${oldStatus}** to: **${newStatus}**`,
            },
          ],
        };
        sendOrderLogMessage(codeMessage);
        await session.commitTransaction();
        return updatedOrder;
      } else {
        throw new BadRequestError(
          'Order had been updated! Please re-load page and try again!',
        );
      }
    } catch (error: any) {
      await session.abortTransaction();
      throw new BadRequestError(error.message);
    }
  }
}

export default OrderService;
