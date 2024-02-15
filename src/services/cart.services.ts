import {
  CartProduct,
  CartProductInput,
  UpdateCartPayload,
} from 'src/constants/types/Cart';
import { BadRequestError } from 'src/helpers/core/error.response';
import cartModel from 'src/models/cart.model';
import {
  addNewProductToCart,
  findByCartId,
  findCartByUserId,
  updateProductQuantity,
} from 'src/models/repositories/cart.repo';
import { findProductById } from 'src/models/repositories/product.repo';
import { convertToObjectId } from 'src/utils/common';

class CartService {
  static async getCartData(userId: string) {
    const foundCart = await findCartByUserId(userId);
    if (!foundCart) {
      throw new BadRequestError('Cart not found!');
    }
    return foundCart;
  }
  static async addToCart(payload: {
    userId: string;
    productInput: CartProductInput;
  }) {
    const { userId, productInput } = payload;
    const foundCart = await findCartByUserId(userId);
    const productData = await findProductById({
      productId: productInput.productId as string,
    });
    if (!productData) {
      throw new BadRequestError('Product not found!');
    }
    const product: CartProduct = {
      ...productInput,
      name: productData.productName,
      price: productData.productPrice,
    };

    // create new cart if cart not exist
    if (!foundCart) {
      const newCart = await addNewProductToCart({
        userId,
        product,
      });
      return newCart;
    }
    // update product quantity if cart exist
    const updatedProducts = await updateProductQuantity({
      userId,
      product,
    });
    return updatedProducts;
  }

  static async updateProductAmount(payload: UpdateCartPayload) {
    const { cartId, productId, quantity, oldQuantity, version } = payload;

    if (parseInt(quantity) <= 0) {
      const updatedCart = this.deleteProductsInCart(cartId, [productId]);
      return updatedCart;
    }

    const foundCart = await findByCartId(cartId);
    if (!foundCart) {
      throw new BadRequestError('Cart not found!');
    }

    const updatedProducts = foundCart.cartProducts.map(item => {
      if (item.productId === productId) {
        if (item.quantity !== oldQuantity) {
          throw new BadRequestError(
            'Cart quantity has been changed, please refresh the page and try again',
          );
        }
        return {
          ...item,
          quantity,
        };
      } else {
        return item;
      }
    });
    foundCart.cartProducts = updatedProducts;

    await foundCart.save();
    return foundCart;
  }

  static async deleteProductsInCart(cartId: string, productIds: string[]) {
    await cartModel.updateOne(
      {
        _id: convertToObjectId(cartId),
        cartState: 'active',
      },
      {
        $pull: { cartProducts: { productId: { $in: productIds } } },
      },
      { new: true },
    );
    return null;
  }
}
export default CartService;
