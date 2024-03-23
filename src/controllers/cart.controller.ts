import { RequestHandler } from 'express';
import { CartProductInput, UpdateCartPayload } from 'src/constants/types/Cart';
import { OK } from 'src/helpers/core/success.response';
import CartService from 'src/services/cart.services';
import getKeyStored from 'src/utils/getKeyStored';
import { isObjectId, yupArray, yupObject } from 'src/utils/validate';
import * as Yup from 'yup';

class CartController {
  // authentication
  static getCartData: RequestHandler = async (req, res) => {
    const keyStored = getKeyStored(req);
    new OK({
      message: 'Get cart data successfully!',
      metadata: await CartService.getCartData(keyStored.user),
    }).send(res);
  };

  static addToCartSchema = yupObject({
    body: yupObject({
      product: yupObject({
        productId: isObjectId.required(),
        shopId: isObjectId.required(),
        quantity: Yup.number().required(),
      }),
    }),
  });
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

  static changeProductAmountSchema = yupObject({
    body: yupObject({
      cartId: isObjectId.required(),
      productId: isObjectId.required(),
      quantity: Yup.number().required(),
      oldQuantity: Yup.number().required(),
      version: Yup.number().required(),
    }),
  });
  static changeProductAmount: RequestHandler = async (req, res) => {
    const payload = req.body;

    new OK({
      message: 'Update Product quantity successfully!',
      metadata: await CartService.updateProductAmount(
        payload as UpdateCartPayload,
      ),
    }).send(res);
  };

  static deleteProductInCartSchema = yupObject({
    params: yupObject({
      cartId: isObjectId.required(),
    }),
    body: yupObject({
      productIds: yupArray(isObjectId).required(),
    }),
  });
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
