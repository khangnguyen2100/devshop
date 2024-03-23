import express from 'express';
import ProductController from 'src/controllers/product.controller';
import authentication from 'src/middleware/authentication';
import { asyncHandler } from 'src/middleware/errorHandler';
import { validate } from 'src/utils/validate';

const router = express.Router();

router.get(
  '/search',
  validate(ProductController.searchProductByUserSchema),
  asyncHandler(ProductController.searchProductByUser),
);
router.get(
  '/getAll',
  validate(ProductController.getAllProductsSchema),
  asyncHandler(ProductController.getAllProducts),
);
router.get(
  '/get-products-in-category/:category',
  validate(ProductController.getProductInCategorySchema),
  asyncHandler(ProductController.getProductInCategory),
);
router.get(
  '/:productId',
  validate(ProductController.getProductByIdSchema),
  asyncHandler(ProductController.getProductById),
);
router.get(
  '/publish/all/:shopId',
  validate(ProductController.getAllPublishProductsInShopSchema),
  asyncHandler(ProductController.getAllPublishProductsInShop),
);

router.use(authentication);

router.post(
  '/createNew',
  validate(ProductController.createProductByShopSchema),
  asyncHandler(ProductController.createProductByShop),
);
router.patch(
  '',
  validate(ProductController.updateProductByShopSchema),
  asyncHandler(ProductController.updateProductByShop),
);

router.get(
  '/drafts/all',
  validate(ProductController.getAllDraftByShopSchema),
  asyncHandler(ProductController.getAllDraftByShop),
);

router.post(
  '/publish/:productId',
  validate(ProductController.publishProductByShopSchema),
  asyncHandler(ProductController.publishProductByShop),
);

router.post(
  '/change-inventory/:productId',
  validate(ProductController.changeInventorySchema),
  asyncHandler(ProductController.changeInventory),
);
router.post(
  '/unpublish/:productId',
  validate(ProductController.unPublishProductByShopSchema),
  asyncHandler(ProductController.unPublishProductByShop),
);

export default router;
