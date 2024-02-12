import { RequestHandler } from 'express';
import {
  CartProduct,
  CartProductInput,
  UpdateCartPayload,
} from 'src/constants/types/Cart';
import { OK } from 'src/helpers/core/success.response';
import CartService from 'src/services/cart.services';
import getKeyStored from 'src/utils/getKeyStored';

class CartController {
  // authentication
  static getCartData: RequestHandler = async (req, res) => {
    const keyStored = getKeyStored(req);
    new OK({
      message: 'Get cart data successfully!',
      metadata: await CartService.getCartData(keyStored.user),
    }).send(res);
  };
  static addToCart: RequestHandler = async (req, res) => {
    const keyStored = getKeyStored(req);
    const { product } = req.body;

    new OK({
      message: 'Add to cart successfully!',
      metadata: await CartService.addToCart({
        userId: keyStored.user,
        productInput: product as CartProductInput,
      }),
    }).send(res);
  };

  static changeProductAmount: RequestHandler = async (req, res) => {
    const payload = req.body;

    new OK({
      message: 'Update Product quantity successfully!',
      metadata: await CartService.updateProductAmount(
        payload as UpdateCartPayload,
      ),
    }).send(res);
  };
  static deleteProductInCart: RequestHandler = async (req, res) => {
    const { cartId } = req.params;
    const { productIds } = req.body;
    new OK({
      message: 'Delete product in cart successfully!',
      metadata: await CartService.deleteProductsInCart(
        cartId as string,
        productIds as string[],
      ),
    }).send(res);
  };
}

export default CartController;
