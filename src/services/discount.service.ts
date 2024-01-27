import { discountAppliesToType } from 'src/constants/enums/product';
import TDiscount from 'src/constants/types/Discount';
import TProduct from 'src/constants/types/Product';
import { TPaginationQuery } from 'src/constants/types/common';
import {
  findDiscountByCode,
  getAllDiscountByShop,
  insertDiscount,
} from 'src/models/repositories/discount.repo';
import { queryProduct } from 'src/models/repositories/product.repo';
import { convertToObjectId } from 'src/utils/common';

class DiscountService {
  static async createDiscounts(payload: TDiscount) {
    // valid data
    const currentDate = new Date();
    if (
      currentDate < new Date(payload.discountStartDate) ||
      new Date(payload.discountEndDate) < currentDate
    ) {
      throw new Error('Invalid date');
    }
    if (
      new Date(payload.discountStartDate) > new Date(payload.discountEndDate)
    ) {
      throw new Error('Start date must be before end date');
    }

    // find exist discount
    const existDiscount = await findDiscountByCode(
      payload.discountCode,
      convertToObjectId(payload.discountShopId),
    );
    if (existDiscount) {
      throw new Error('Discount code already exist. Please try another code');
    }

    // create discount
    const newDiscount = await insertDiscount(payload);
    return newDiscount;
  }

  static async getAllAvailableProductsByDiscountCode(props: {
    discountCode: string;
    shopId: string;
    limit?: number;
    page?: number;
  }) {
    const { discountCode, shopId, limit, page } = props;

    const foundDiscount = await findDiscountByCode(
      discountCode,
      convertToObjectId(shopId),
    );
    if (!foundDiscount) {
      throw new Error('Discount code not found');
    }
    const { discountAppliesTo, discountProductsId } = foundDiscount;

    let products: TProduct[] = [];
    if (discountAppliesTo === discountAppliesToType.ALL) {
      const query = {
        createdBy: convertToObjectId(shopId),
        isPublished: true,
      };

      products = await queryProduct({
        query,
        page,
        limit,
      });
    }
    if (discountAppliesTo === discountAppliesToType.SPECIFIC) {
      const query = {
        _id: {
          $in: discountProductsId.map(id => convertToObjectId(id)),
        },
        isPublished: true,
      };
      products = await queryProduct({
        query,
        page,
        limit,
      });
    }

    return products;
  }

  static async getAllDiscountByShop(
    shopId: string,
    pagination: TPaginationQuery,
  ) {
    const discounts = await getAllDiscountByShop(
      convertToObjectId(shopId),
      pagination,
    );
    return discounts;
  }
}
export default DiscountService;
