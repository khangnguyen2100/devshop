import express from 'express';
import authRouter from 'src/routes/v1/auth';
import cartRouter from 'src/routes/v1/cart';
import orderRouter from 'src/routes/v1/order';
import discountRouter from 'src/routes/v1/discount';
import productRouter from 'src/routes/v1/product';
import shopRouter from 'src/routes/v1/shop';

const v1Root = express.Router();

v1Root.use('/auth', authRouter);
v1Root.use('/shop', shopRouter);

v1Root.use('/product', productRouter);
v1Root.use('/discount', discountRouter);
v1Root.use('/cart', cartRouter);
v1Root.use('/order', orderRouter);

export default v1Root;
