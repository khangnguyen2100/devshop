import express from 'express';
import DiscountController from 'src/controllers/discount.controller';
import shopAuthentication from 'src/middleware/authentication';
import { asyncHandler } from 'src/middleware/errorHandler';
import { validate } from 'src/utils/validate';

const router = express.Router();

router.get(
  '/get-all-available-products-by-discount',
  validate(
    DiscountController.getAllAvailableProductsByDiscountCodeInShopSchema,
  ),
  asyncHandler(DiscountController.getAllAvailableProductsByDiscountCodeInShop),
);
router.get(
  '/get-all-discounts',
  validate(DiscountController.getAllDiscountInShopSchema),
  asyncHandler(DiscountController.getAllDiscountInShop),
);

router.use(shopAuthentication);

router.get(
  '/get-discount-amount',
  validate(DiscountController.getDiscountAmountByUserSchema),
  asyncHandler(DiscountController.getDiscountAmountByUser),
);
router.post(
  '/createNew',
  validate(DiscountController.createDiscountByShopSchema),
  asyncHandler(DiscountController.createDiscountByShop),
);
router.delete(
  '/:discountId',
  validate(DiscountController.deleteDiscountByShopSchema),
  asyncHandler(DiscountController.deleteDiscountByShop),
);
router.post(
  '/cancel-discount',
  validate(DiscountController.cancelDiscountByUserSchema),
  asyncHandler(DiscountController.cancelDiscountByUser),
);

export default router;
