import { RequestHandler } from 'express';
import AuthService from 'src/services/auth.service';

class AuthController {
  static signUp: RequestHandler = async (_req, res) => {
    return res.status(201).json(await AuthService.signUp(_req.body));
  };
}

export default AuthController;
