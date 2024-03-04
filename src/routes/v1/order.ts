import express from 'express';
import OrderController from 'src/controllers/order.controller';
import authentication from 'src/middleware/authentication';
import { asyncHandler } from 'src/middleware/errorHandler';

const router = express.Router();

router.use(authentication);

router.post(
  '/checkout-review',
  asyncHandler(OrderController.getCheckoutReview),
);
router.post(
  '/order-by-user/:cartId',
  asyncHandler(OrderController.orderByUser),
);

export default router;
