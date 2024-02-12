import express from 'express';
import CartController from 'src/controllers/cart.controller';
import authentication from 'src/middleware/authentication';
import { asyncHandler } from 'src/middleware/errorHandler';

const router = express.Router();

router.use(authentication);

router.get('/', asyncHandler(CartController.getCartData));
router.post('/add-product', asyncHandler(CartController.addToCart));
router.put('/update', asyncHandler(CartController.changeProductAmount));
router.delete('/:cartId', asyncHandler(CartController.deleteProductInCart));

export default router;
