import express from 'express';
import authRouter from 'src/routes/v1/auth';
import shopRouter from 'src/routes/v1/shop';
import productRouter from 'src/routes/v1/product';
import discountRouter from 'src/routes/v1/discount';

const v1Root = express.Router();

v1Root.use('/auth', authRouter);
v1Root.use('/shop', shopRouter);

v1Root.use('/product', productRouter);
v1Root.use('/discount', discountRouter);

export default v1Root;
