import mongoose from 'mongoose';
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
import { orderStatus } from 'src/constants/enums/Order';

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
      const createdOrder = await createOrder(
        {
          orderUserId: userId,
          orderShippingAddress: userAddress,
          orderCheckoutPrices: prices,
          orderPaymentMethod: paymentMethod,
          orderProducts: products,
        },
        session,
      );
      // remove product in cart

      await session.commitTransaction();

      return {
        orderReviewDetail,
        prices,
        products,
        createdOrder,
      };
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
    console.log('foundOrder:', foundOrder);
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
    console.log('orderProducts:', orderProducts);
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
      console.log('canceledOrder:', canceledOrder);
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
  static async updateStatusByShop() {}
}

export default OrderService;
