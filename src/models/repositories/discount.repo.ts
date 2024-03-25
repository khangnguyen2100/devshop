import { SortOrder, Types } from 'mongoose';
import TDiscount from 'src/constants/types/Discount';
import { getSelectData } from 'src/utils/common';
import { TPaginationQuery } from 'src/constants/types/common';
import { BadRequestError } from 'src/helpers/core/error.response';

import discountModel from '../discount.model';

const queryDiscount = async ({
  query,
  page = 0,
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
  const skip = page * limit;
  const sortBy = {
    updatedAt: sort as SortOrder,
  };
  const total = await discountModel.countDocuments(query);
  const result = await discountModel
    .find(query)
    .populate('discountShopId', 'name email _id')
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean()
    .exec();

  return {
    page,
    limit,
    total,
    data: result,
  };
};

const findDiscountByCode = async (code: string, shopId: Types.ObjectId) => {
  const findDiscount = await discountModel
    .findOne({
      discountCode: code,
      discountShopId: shopId,
    })
    .lean()
    .exec();
  return findDiscount;
};
const findAvailableDiscount = async (code: string, shopId: Types.ObjectId) => {
  const foundDiscount = await findDiscountByCode(code, shopId);
  if (!foundDiscount) {
    throw new BadRequestError('Discount code not found');
  }
  if (!foundDiscount.discountIsActive) {
    throw new BadRequestError('Discount code is expired');
  }
  return foundDiscount;
};
const disableDiscount = async (discountId: Types.ObjectId) => {
  await discountModel.findByIdAndUpdate(discountId, {
    discountIsActive: false,
  });
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

export {
  findDiscountByCode,
  getAllDiscountByShop,
  insertDiscount,
  findAvailableDiscount,
  disableDiscount,
};
