import express from 'express';
import AuthController from 'src/controllers/auth.controller';
import authentication from 'src/middleware/authentication';
import { asyncHandler } from 'src/middleware/errorHandler';

const router = express.Router();

router.post('/sign-up', asyncHandler(AuthController.signUp));
router.post('/login', asyncHandler(AuthController.login));
router.get('/refresh-token', asyncHandler(AuthController.refreshToken));

router.use(authentication);
router.get('/logout', asyncHandler(AuthController.logout));

export default router;
