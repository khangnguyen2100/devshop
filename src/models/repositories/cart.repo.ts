import { CartProduct, CartProductInput } from 'src/constants/types/Cart';
import { convertToObjectId } from 'src/utils/common';
import { BadRequestError } from 'src/helpers/core/error.response';

import cartModel from '../cart.model';

import { findProductById } from './product.repo';

const findCartByUserId = async (userId: string) => {
  const foundCart = await cartModel
    .findOne({
      cartUserId: convertToObjectId(userId),
      cartState: 'active',
    })
    .exec();
  return foundCart;
};
const findByCartId = async (id: string) => {
  const foundCart = await cartModel.findOne({
    _id: convertToObjectId(id),
    cartState: 'active',
  });
  return foundCart;
};

const updateProductQuantity = async (payload: {
  userId: string;
  product: CartProduct;
}) => {
  const { product, userId } = payload;
  // Fetch the product from the database
  const dbProduct = await findProductById({
    productId: product.productId.toString(),
    shopId: product.shopId.toString(),
  });
  // Check if the product quantity is sufficient
  if (dbProduct.productQuantity < product.quantity) {
    throw new BadRequestError('Product amount is not enough');
  }

  // change quantity of product in cart
  try {
    const query = {
      cartUserId: userId.toString(),
      cartState: 'active',
      'cartProducts.productId': product.productId,
    };
    const updateSet = {
      $inc: {
        'cartProducts.$.quantity': product.quantity,
      },
    };
    const result = await cartModel.findOneAndUpdate(query, updateSet, {
      new: true,
      upsert: true,
    });
    return result;
  } catch (error) {
    // if product not found in cart, add new product to cart
    return await addNewProductToCart({
      userId,
      product,
    });
  }
};

const addNewProductToCart = async (payload: {
  userId: string;
  product: CartProduct;
}) => {
  const query = {
    cartUserId: payload.userId,
    cartState: 'active',
  };
  const updateOrInsert = {
    $addToSet: {
      cartProducts: payload.product,
    },
  };
  const options = {
    upsert: true,
    new: true,
  };
  return await cartModel.findOneAndUpdate(query, updateOrInsert, options);
};
const getCartProductsData = async (
  products: CartProductInput[],
): Promise<CartProduct[]> => {
  const result = await Promise.all(
    products.map(async (item: CartProductInput) => {
      const product = await findProductById({
        productId: item.productId.toString(),
        shopId: item.shopId.toString(),
      });
      if (!product) return null;
      return {
        ...item,
        price: product.productPrice,
        name: product.productName,
      } as CartProduct;
    }),
  );
  return result.filter(item => item) as CartProduct[];
};

export {
  addNewProductToCart,
  findByCartId,
  findCartByUserId,
  updateProductQuantity,
  getCartProductsData,
};
