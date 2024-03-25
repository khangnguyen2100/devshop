import { Model, SortOrder, Types } from 'mongoose';
import { CartProductInput } from 'src/constants/types/Cart';
import { TProductResponse } from 'src/constants/types/Product';
import { BadRequestError } from 'src/helpers/core/error.response';
import {
  convertToObjectId,
  getSelectData,
  getUnSelectData,
} from 'src/utils/common';

import productModel from '../product.model';

const queryProduct = async ({
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
  const total = await productModel.countDocuments(query);
  const result = await productModel
    .find(query)
    .populate('createdBy', 'name email _id')
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean()
    .exec();
  return {
    page,
    limit,
    data: result,
    total,
  };
};

const getAllProducts = async ({ query }: { query: object }) => {
  return await productModel
    .find(query)
    .populate('createdBy', 'name email _id')
    .lean()
    .exec();
};

const searchProductsByUser = async ({
  keyword,
  page = 0,
  limit = 50,
  sort = 'asc',
  select = [],
}: {
  keyword: string;
  page?: number;
  limit?: number;
  sort?: string;
  select?: string[];
}) => {
  const skip = page * limit;
  const sortBy = {
    updatedAt: sort as SortOrder,
    score: { $meta: 'textScore' },
  };
  const results = await productModel
    .find(
      {
        $text: {
          $search: keyword,
          $caseSensitive: false,
        },
        isPublished: true,
      },
      {
        score: { $meta: 'textScore' },
      },
    )
    .populate('createdBy', 'name email _id')
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
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

const findProductById = async ({
  productId,
  shopId,
  unSelect = [],
}: {
  productId: string;
  shopId?: string;
  unSelect?: string[];
}) => {
  const query = {
    _id: convertToObjectId(productId),
    isPublished: true,
  } as any;

  if (shopId) {
    query.createdBy = convertToObjectId(shopId);
  }

  const foundProduct = await productModel
    .findOne(query)
    .populate('createdBy', 'name email _id')
    .select(getUnSelectData(unSelect))
    .lean();

  if (!foundProduct) {
    throw new BadRequestError('Product is not find');
  }

  return foundProduct;
};

const updateProductById = async ({
  productId,
  model,
  isNew = true,
  payload,
}: {
  productId: string;
  model: Model<any>;
  payload: any;
  isNew?: boolean;
}) => {
  const updatedProduct = await model.findByIdAndUpdate(productId, payload, {
    new: isNew,
  });
  return updatedProduct;
};
const getProductsData = async (
  products: CartProductInput[],
): Promise<TProductResponse[]> => {
  const result = await Promise.all(
    products.map(async (item: CartProductInput) => {
      const product = await findProductById({
        productId: item.productId.toString(),
        shopId: item.shopId.toString(),
      });
      if (!product) return null;
      return product as TProductResponse;
    }),
  );
  return result.filter(item => item) as TProductResponse[];
};

export {
  findProductById,
  getAllProducts,
  getProductsData,
  publishProductByShop,
  queryProduct,
  searchProductsByUser,
  unPublishProductByShop,
  updateProductById,
};
