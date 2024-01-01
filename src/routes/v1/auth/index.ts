import express from 'express';
import AuthController from 'src/controllers/auth.controller';

const router = express.Router();

router.post('/sign-up', AuthController.signUp);

export default router;
