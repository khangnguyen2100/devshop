import { RequestHandler } from 'express';
import { Created } from 'src/helpers/success.response';
import AuthService from 'src/services/auth.service';

class AuthController {
  static signUp: RequestHandler = async (_req, res) => {
    return new Created({
      message: 'Shop created successfully!',
      metadata: await AuthService.signUp(_req.body),
    }).send(res);
  };
}

export default AuthController;
