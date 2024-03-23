import {
  discountAppliesToType,
  discountType,
} from 'src/constants/enums/product';
import { CartProductInput } from 'src/constants/types/Cart';
import TDiscount from 'src/constants/types/Discount';
import { TProductResponse } from 'src/constants/types/Product';
import { TPaginationQuery } from 'src/constants/types/common';
import { BadRequestError } from 'src/helpers/core/error.response';
import discountModel from 'src/models/discount.model';
import { getCartProductsData } from 'src/models/repositories/cart.repo';
import {
  disableDiscount,
  findAvailableDiscount,
  findDiscountByCode,
  getAllDiscountByShop,
  insertDiscount,
} from 'src/models/repositories/discount.repo';
import {
  findProductById,
  getAllProducts,
} from 'src/models/repositories/product.repo';
import { convertToObjectId } from 'src/utils/common';

const handleGetDiscountValue = (props: {
  totalPrice: number;
  discountValue: number;
  discountTypeValue: string;
}) => {
  const { discountTypeValue, discountValue, totalPrice } = props;
  let result = 0;
  if (discountTypeValue === discountType.PERCENT) {
    result = totalPrice * (discountValue / 100);
  } else {
    result = discountValue;
  }
  return result;
};

class DiscountService {
  static async createDiscountByShop(payload: TDiscount) {
    // valid data
    const currentDate = new Date();
    if (
      currentDate < new Date(payload.discountStartDate) ||
      new Date(payload.discountEndDate) < currentDate
    ) {
      throw new BadRequestError('Invalid date');
    }
    if (
      new Date(payload.discountStartDate) > new Date(payload.discountEndDate)
    ) {
      throw new BadRequestError('Start date must be before end date');
    }

    // find exist discount
    const existDiscount = await findDiscountByCode(
      payload.discountCode,
      convertToObjectId(payload.discountShopId),
    );
    if (existDiscount) {
      throw new BadRequestError(
        'Discount code already exist. Please try another code',
      );
    }

    // create discount
    const newDiscount = await insertDiscount(payload);
    return newDiscount;
  }

  static async getAllAvailableProductsByDiscountCode(props: {
    discountCode: string;
    shopId: string;
  }) {
    const { discountCode, shopId } = props;

    const foundDiscount = await findDiscountByCode(
      discountCode,
      convertToObjectId(shopId),
    );
    if (!foundDiscount) {
      throw new BadRequestError('Discount code not found');
    }
    const {
      discountAppliesTo,
      discountProductsId,
      discountIsActive,
      discountUsesCount,
      discountMaxUses,
    } = foundDiscount;

    if (!discountIsActive) {
      throw new BadRequestError('Discount is expired');
    }
    if (!discountIsActive) {
      throw new BadRequestError('Discount is expired');
    }
    if (discountUsesCount >= discountMaxUses) {
      throw new BadRequestError('Discount is expired');
    }

    let products: TProductResponse[] = [];
    if (discountAppliesTo === discountAppliesToType.ALL) {
      const query = {
        createdBy: convertToObjectId(shopId),
        isPublished: true,
      };

      products = (await getAllProducts({
        query,
      })) as TProductResponse[];
    }
    if (discountAppliesTo === discountAppliesToType.SPECIFIC) {
      const query = {
        _id: {
          $in: discountProductsId.map(id => convertToObjectId(id)),
        },
        isPublished: true,
      };
      products = (await getAllProducts({
        query,
      })) as TProductResponse[];
    }

    return products;
  }

  static async getAllDiscountInShop(
    shopId: string,
    pagination: TPaginationQuery,
  ) {
    const discounts = await getAllDiscountByShop(
      convertToObjectId(shopId),
      pagination,
    );
    return discounts;
  }

  static async getDiscountAmountByUser(props: {
    discountCode: string;
    shopId: string;
    userId: string;
    cartProducts: CartProductInput[];
  }) {
    const { discountCode, shopId, cartProducts, userId } = props;

    const foundDiscount = await findAvailableDiscount(
      discountCode,
      convertToObjectId(shopId),
    );

    const {
      discountAppliesTo,
      discountProductsId,
      discountUsesCount,
      discountMaxUses,
      discountMaxUsesPerUser,
      discountMinOrderValue,
      discountUsersUsed,
      discountValue,
      discountEndDate,
      discountStartDate,
      discountType,
    } = foundDiscount;

    // check discount is available
    const currentDate = new Date();
    if (
      currentDate > new Date(discountEndDate) ||
      currentDate < new Date(discountStartDate)
    ) {
      disableDiscount(foundDiscount._id);
      throw new BadRequestError('Discount is not available now');
    }

    if (cartProducts.some(item => item.shopId !== shopId)) {
      throw new BadRequestError('Product not belong to this shop');
    }

    // check discount is used
    if (discountUsesCount >= discountMaxUses) {
      disableDiscount(foundDiscount._id);
      throw new BadRequestError('Discount is expired');
    }

    // check product is used by discount
    if (discountAppliesTo === discountAppliesToType.SPECIFIC) {
      const productNotApply = cartProducts.find(item => {
        return !discountProductsId.includes(item.productId);
      });
      if (productNotApply) {
        const product = await findProductById({
          productId: productNotApply.productId as string,
          shopId: productNotApply.shopId as string,
        });
        throw new BadRequestError(
          `Discount is not available for product: ${product.productName}`,
        );
      }
    }

    // check discount is used by user
    const usedByUser = discountUsersUsed.filter(item => item === userId);
    if (usedByUser.length >= discountMaxUsesPerUser) {
      throw new BadRequestError('You cant use this discount anymore');
    }

    // check cart value is enough
    const cartProductsData = await getCartProductsData(cartProducts);
    const totalCartValue = cartProductsData.reduce((acc, curr) => {
      return acc + curr.price * curr.quantity;
    }, 0);
    if (totalCartValue < discountMinOrderValue) {
      throw new BadRequestError(
        `Your cart value is not enough, minium value is ${discountMinOrderValue}`,
      );
    }

    const finalDiscountValue = handleGetDiscountValue({
      totalPrice: totalCartValue,
      discountValue,
      discountTypeValue: discountType,
    });
    const finalPrice = totalCartValue - finalDiscountValue;
    return {
      totalPrice: totalCartValue,
      discountPrice: finalDiscountValue,
      finalPrice: finalPrice > 0 ? finalPrice : 0,
    };
  }

  static async deleteDiscountByShop(discountId: string, shopId: string) {
    const deletedDiscount = await discountModel.findOneAndDelete({
      _id: convertToObjectId(discountId),
      discountShopId: convertToObjectId(shopId),
    });
    return deletedDiscount;
  }

  static async cancelDiscountByUser(props: {
    discountCode: string;
    shopId: string;
    userId: string;
  }) {
    const { discountCode, shopId, userId } = props;
    const foundDiscount = await findAvailableDiscount(
      discountCode,
      convertToObjectId(shopId),
    );
    const result = await discountModel.findOneAndUpdate(
      {
        _id: foundDiscount._id,
        discountShopId: convertToObjectId(shopId),
      },
      {
        $pull: {
          discountUsersUsed: userId,
        },
        $inc: {
          discountUsesCount: -1,
        },
      },
    );
    return result;
  }
}
export default DiscountService;
