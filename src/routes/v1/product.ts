import express from 'express';
import ProductController from 'src/controllers/product.controller';
import { asyncHandler } from 'src/middleware/errorHandler';

const router = express.Router();

router.post('/createNew', asyncHandler(ProductController.createProduct));

export default router;
