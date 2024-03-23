import express from 'express';
import OrderController from 'src/controllers/order.controller';
import authentication from 'src/middleware/authentication';
import { asyncHandler } from 'src/middleware/errorHandler';
import { validate } from 'src/utils/validate';

const router = express.Router();

router.use(authentication);

router.post(
  '/checkout-review',
  validate(OrderController.getCheckoutReviewSchema),
  asyncHandler(OrderController.getCheckoutReview),
);
router.post(
  '/order-by-user/:cartId',
  validate(OrderController.orderByUserSchema),
  asyncHandler(OrderController.orderByUser),
);

export default router;
