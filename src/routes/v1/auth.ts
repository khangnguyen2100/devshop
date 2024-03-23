import express from 'express';
import AuthController from 'src/controllers/auth.controller';
import authentication from 'src/middleware/authentication';
import { asyncHandler } from 'src/middleware/errorHandler';
import { validate } from 'src/utils/validate';

const router = express.Router();

router.post(
  '/sign-up',
  validate(AuthController.signUpSchema),
  asyncHandler(AuthController.signUp),
);
router.post(
  '/login',
  validate(AuthController.loginSchema),
  asyncHandler(AuthController.login),
);
router.get('/refresh-token', asyncHandler(AuthController.refreshToken));

router.use(authentication);
router.get('/logout', asyncHandler(AuthController.logout));

export default router;
