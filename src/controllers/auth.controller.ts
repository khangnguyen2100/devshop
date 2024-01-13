import { RequestHandler } from 'express';
import {
  LOGIN_MESSAGES,
  LOGOUT_MESSAGES,
  SIGNUP_MESSAGES,
} from 'src/constants/messages';
import { KeyToken } from 'src/constants/types/KeyToken';
import { Created, SuccessResponse } from 'src/helpers/core/success.response';
import AuthService from 'src/services/auth.service';

class AuthController {
  static signUp: RequestHandler = async (req, res) => {
    return new Created({
      message: SIGNUP_MESSAGES.SUCCESS,
      metadata: await AuthService.signUp(req.body),
    }).send(res);
  };

  static login: RequestHandler = async (req, res) => {
    const { body, cookies } = req;

    return new SuccessResponse({
      message: LOGIN_MESSAGES.SUCCESS,
      metadata: await AuthService.login({
        ...body,
        refreshToken: cookies.refreshToken || null,
      }),
    }).send(res);
  };

  static logout: RequestHandler = async (req, res) => {
    const keyStored = (req as any).keyStored as KeyToken;

    return new SuccessResponse({
      message: LOGOUT_MESSAGES.SUCCESS,
      metadata: await AuthService.logout(keyStored),
    }).send(res);
  };
}

export default AuthController;
