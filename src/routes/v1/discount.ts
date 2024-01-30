import express from 'express';
import DiscountController from 'src/controllers/discount.controller';
import authentication from 'src/middleware/authentication';
import { asyncHandler } from 'src/middleware/errorHandler';

const router = express.Router();

router.get(
  '/get-all-available-products-by-discount',
  asyncHandler(DiscountController.getAllAvailableProductsByDiscountCodeInShop),
);
router.get(
  '/get-all-discounts',
  asyncHandler(DiscountController.getAllDiscountInShop),
);

router.use(authentication);

router.get(
  '/get-discount-amount',
  asyncHandler(DiscountController.getDiscountAmountByUser),
);
router.post(
  '/createNew',
  asyncHandler(DiscountController.createDiscountByShop),
);
router.delete(
  '/:discountId',
  asyncHandler(DiscountController.deleteDiscountByShop),
);
router.post(
  '/cancel-discount',
  asyncHandler(DiscountController.cancelDiscountByUser),
);

export default router;
