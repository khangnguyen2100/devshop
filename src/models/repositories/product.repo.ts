import { Types } from 'mongoose';
import { BadRequestError } from 'src/helpers/core/error.response';

import productModel from '../product.model';

const queryProduct = async ({
  query,
  skip,
  limit,
}: {
  query: object;
  skip: number;
  limit: number;
}) => {
  return await productModel
    .find(query)
    .populate('createdBy', 'name email _id')
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
};

const searchProductsByUser = async ({
  keyword,
  skip,
  limit,
}: {
  keyword: string;
  skip: number;
  limit: number;
}) => {
  const results = await productModel
    .find(
      {
        $text: { $search: keyword },
        isPublished: true,
      },
      {
        score: { $meta: 'textScore' },
      },
    )
    .populate('createdBy', 'name email _id')
    .sort({ updatedAt: -1, score: { $meta: 'textScore' } })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
  return results;
};

const publishProductByShop = async ({
  productShop,
  productId,
}: {
  productShop: string;
  productId: string;
}) => {
  const foundProduct = await productModel.findOne({
    _id: new Types.ObjectId(productId),
    createdBy: new Types.ObjectId(productShop),
  });

  if (!foundProduct) {
    throw new BadRequestError('Product is not find');
  }

  const { modifiedCount } = await foundProduct.updateOne({
    isPublished: true,
    isDraft: false,
  });
  return Boolean(modifiedCount);
};

const unPublishProductByShop = async ({
  productShop,
  productId,
}: {
  productShop: string;
  productId: string;
}) => {
  const foundProduct = await productModel.findOne({
    _id: new Types.ObjectId(productId),
    createdBy: new Types.ObjectId(productShop),
  });

  if (!foundProduct) {
    throw new BadRequestError('Product is not find');
  }

  const { modifiedCount } = await foundProduct.updateOne({
    isPublished: false,
    isDraft: true,
  });
  return Boolean(modifiedCount);
};

export {
  publishProductByShop,
  queryProduct,
  searchProductsByUser,
  unPublishProductByShop,
};
