import { RequestHandler } from 'express';
import { Created, SuccessResponse } from 'src/helpers/success.response';
import AuthService from 'src/services/auth.service';

class AuthController {
  static signUp: RequestHandler = async (_req, res) => {
    return new Created({
      message: 'Shop created successfully!',
      metadata: await AuthService.signUp(_req.body),
    }).send(res);
  };
  static login: RequestHandler = async (_req, res) => {
    return new SuccessResponse({
      message: 'Login successfully!',
      metadata: await AuthService.login({
        ..._req.body,
        refreshToken: _req.cookies.refreshToken || null,
      }),
    }).send(res);
  };
}

export default AuthController;
