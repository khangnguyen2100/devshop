import {
  CartProduct,
  CartProductInput,
  UpdateCartPayload,
} from 'src/constants/types/Cart';
import TProduct from 'src/constants/types/Product';
import { BadRequestError } from 'src/helpers/core/error.response';
import cartModel from 'src/models/cart.model';
import {
  addNewProductToCart,
  findByCartId,
  findCartByUserId,
  updateProductQuantity,
} from 'src/models/repositories/cart.repo';
import {
  findProductById,
  getProductsData,
} from 'src/models/repositories/product.repo';
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
      shopId: productInput.shopId as string,
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

    if (quantity <= 0) {
      const updatedCart = this.deleteProductsInCart(cartId, [productId]);
      return updatedCart;
    }

    const foundCart = await findByCartId(cartId);
    if (!foundCart) {
      throw new BadRequestError('Cart not found!');
    }
    const productsData = await getProductsData(foundCart.cartProducts);
    const updatedProducts = productsData.map(
      (item: TProduct, index: number) => {
        if (item._id.toString() === productId) {
          if (foundCart.cartProducts[index].quantity !== oldQuantity) {
            throw new BadRequestError(
              'Cart quantity has been changed, please refresh the page and try again',
            );
          }
          if (item?.productQuantity < quantity) {
            throw new BadRequestError(
              `Product ${item.productName} is not enough amount`,
            );
          }

          return {
            price: item.productPrice,
            productId: item._id.toString(),
            shopId: item.createdBy.toString(),
            name: item.productName,
            quantity,
          } as CartProduct;
        } else {
          return {
            price: item.productPrice,
            productId: item._id.toString(),
            shopId: item.createdBy.toString(),
            name: item.productName,
            quantity: item.productQuantity,
          } as CartProduct;
        }
      },
    );
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
