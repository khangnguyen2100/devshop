import { SortOrder, Types } from 'mongoose';
import TDiscount from 'src/constants/types/Discount';

import discountModel from '../discount.model';
import { getSelectData } from 'src/utils/common';
import { TPaginationQuery } from 'src/constants/types/common';

const queryDiscount = async ({
  query,
  page = 1,
  limit = 50,
  sort = 'asc',
  select = [],
}: {
  query: object;
  page?: number;
  limit?: number;
  sort?: string;
  select?: string[];
}) => {
  const skip = (page - 1) * limit;
  const sortBy = {
    updatedAt: sort as SortOrder,
  };

  return await discountModel
    .find(query)
    .populate('discountShopId', 'name email _id')
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean()
    .exec();
};

const findDiscountByCode = async (code: string, shopId: Types.ObjectId) => {
  const findDiscount = await discountModel
    .findOne({
      discountCode: code,
      discountShopId: shopId,
      discountIsActive: true,
    })
    .lean();
  return findDiscount;
};
const insertDiscount = async (payload: TDiscount) => {
  return await discountModel.create(payload);
};

// QUERY

const getAllDiscountByShop = async (
  shopId: Types.ObjectId,
  pagination: TPaginationQuery,
) => {
  const query = {
    discountShopId: shopId,
    discountIsActive: true,
  };
  const discounts = await queryDiscount({ query, ...pagination });
  return discounts;
};

export { findDiscountByCode, getAllDiscountByShop, insertDiscount };
