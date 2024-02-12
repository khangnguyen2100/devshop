import { CartProduct } from 'src/constants/types/Cart';
import { convertToObjectId } from 'src/utils/common';

import cartModel from '../cart.model';

const findCartByUserId = async (userId: string) => {
  const foundCart = await cartModel
    .findOne({
      cartUserId: convertToObjectId(userId),
    })
    .exec();
  return foundCart;
};
const findByCartId = async (id: string) => {
  const foundCart = await cartModel.findById(id);
  return foundCart;
};

const updateProductQuantity = async (payload: {
  userId: string;
  product: CartProduct;
}) => {
  const { product, userId } = payload;

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

export {
  addNewProductToCart,
  findByCartId,
  findCartByUserId,
  updateProductQuantity,
};
