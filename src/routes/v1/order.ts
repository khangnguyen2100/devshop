import express from 'express';
import OrderController from 'src/controllers/order.controller';
import shopAuthentication from 'src/middleware/authentication';
import { asyncHandler } from 'src/middleware/errorHandler';
import { validate } from 'src/utils/validate';

const router = express.Router();

router.use(shopAuthentication);

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
router.post(
  '/cancel-by-user',
  validate(OrderController.cancelOrderSchema),
  asyncHandler(OrderController.cancelOrderByUser),
);
router.post(
  '/update-status',
  validate(OrderController.updateStatusOrderSchema),
  asyncHandler(OrderController.updateOrderStatusByShop),
);

export default router;
