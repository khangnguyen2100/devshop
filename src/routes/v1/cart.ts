import express from 'express';
import CartController from 'src/controllers/cart.controller';
import authentication from 'src/middleware/authentication';
import { asyncHandler } from 'src/middleware/errorHandler';
import { validate } from 'src/utils/validate';

const router = express.Router();

router.use(authentication);

router.get('/', asyncHandler(CartController.getCartData));
router.post(
  '/add-product',
  validate(CartController.addToCartSchema),
  asyncHandler(CartController.addToCart),
);
router.put(
  '/update',
  validate(CartController.changeProductAmountSchema),
  asyncHandler(CartController.changeProductAmount),
);
router.delete(
  '/:cartId',
  validate(CartController.deleteProductInCartSchema),
  asyncHandler(CartController.deleteProductInCart),
);

export default router;
