import {
  PaymentMethod,
  ShippingAddress,
  TOrderData,
} from 'src/constants/types/Order';
import { BadRequestError } from 'src/helpers/core/error.response';
import {
  findCartByUserId,
  getCartProductsData,
} from 'src/models/repositories/cart.repo';
import { createOrder } from 'src/models/repositories/order.repo';
import { CartProduct } from 'src/constants/types/Cart';
import { checkIsEnoughQuantity } from 'src/models/repositories/inventory.repo';
import mongoose from 'mongoose';

import DiscountService from './discount.service';
import { acquireLock, releaseLock } from './redis.service';

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

        const keyLock = await acquireLock({
          cartId,
          productId: productId.toString(),
          quantity,
          session,
        });
        console.log('keyLock:', keyLock);
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

      console.log('commitTransaction:');
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
  static async cancelOrderByUser() {}
  static async updateStatusByShop() {}
}

export default OrderService;
