import { RequestHandler } from 'express';
import { KeyToken } from 'src/constants/types/KeyToken';
import { Created, SuccessResponse } from 'src/helpers/core/success.response';
import AuthService from 'src/services/auth.service';

class AuthController {
  static signUp: RequestHandler = async (req, res) => {
    return new Created({
      message: 'Shop created successfully!',
      metadata: await AuthService.signUp(req.body),
    }).send(res);
  };
  static login: RequestHandler = async (req, res) => {
    const { body, cookies } = req;
    return new SuccessResponse({
      message: 'Login successfully!',
      metadata: await AuthService.login({
        ...body,
        refreshToken: cookies.refreshToken || null,
      }),
    }).send(res);
  };
  static logout: RequestHandler = async (req, res) => {
    const keyStored = (req as any).keyStored as KeyToken;
    return new SuccessResponse({
      message: 'Logout successfully!',
      metadata: await AuthService.logout(keyStored),
    }).send(res);
  };
}

export default AuthController;
