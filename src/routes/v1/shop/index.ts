import express from 'express';
import ShopController from 'src/controllers/shop.controller';

const router = express.Router();

router.get('/', ShopController.getShop);

export default router;
