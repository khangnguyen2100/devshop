import { RequestHandler } from 'express';
import AuthService from 'src/services/auth.service';

class AuthController {
  signUp: RequestHandler = async (_req, res, next) => {
    try {
      return res.status(200).json(await AuthService.signUp(_req.body));
    } catch (error: any) {
      return next(error);
    }
  };
}

export default new AuthController();
