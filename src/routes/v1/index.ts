import express from 'express';
import authRouter from 'src/routes/v1/auth';
import shopRouter from 'src/routes/v1/shop';

const v1Root = express.Router();

v1Root.use('/auth', authRouter);
v1Root.use('/shop', shopRouter);

export default v1Root;
