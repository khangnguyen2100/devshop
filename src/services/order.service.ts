import { TOrderData } from 'src/constants/types/Order';
import { BadRequestError } from 'src/helpers/core/error.response';
import {
  findCartByUserId,
  getCartProductsData,
} from 'src/models/repositories/cart.repo';

import DiscountService from './discount.service';
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
        itemProducts: [],
      };
      const { itemProducts, shopDiscounts } = orderData[i];
      const cartProductsData = await getCartProductsData(itemProducts);

      // calc total price
      const totalPrice = cartProductsData.reduce((arr, curr) => {
        return arr + curr.price * curr.quantity;
      }, 0);
      orderReviewItem.totalPrice = totalPrice;
      orderReviewItem.itemProducts = cartProductsData as never[];

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
      orderReviews,
      ...totalOrderReview,
    };
  }
}

export default OrderService;
