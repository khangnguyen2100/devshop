import express from 'express';
import ProductController from 'src/controllers/product.controller';
import authentication from 'src/middleware/authentication';
import { asyncHandler } from 'src/middleware/errorHandler';

const router = express.Router();

router.get('/search', asyncHandler(ProductController.searchProductByUser));
router.get('/getAll', asyncHandler(ProductController.getAllProducts));
router.get('/:productId', asyncHandler(ProductController.getProductById));

router.use(authentication);

router.post('/createNew', asyncHandler(ProductController.createProduct));
router.patch('', asyncHandler(ProductController.updateProduct));

router.get('/drafts/all', asyncHandler(ProductController.getAllDraftByShop));
router.get('/publish/all', asyncHandler(ProductController.getAllPublishByShop));

router.post(
  '/publish/:productId',
  asyncHandler(ProductController.publishProduct),
);
router.post(
  '/unpublish/:productId',
  asyncHandler(ProductController.unPublishProduct),
);

export default router;
