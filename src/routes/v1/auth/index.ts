import express from 'express';
import AuthController from 'src/controllers/auth.controller';
import { asyncHandler } from 'src/middleware/errorHandler';

const router = express.Router();

router.post('/sign-up', asyncHandler(AuthController.signUp));

export default router;
