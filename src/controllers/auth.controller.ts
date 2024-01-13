import { RequestHandler } from 'express';
import { AUTH_MESSAGES } from 'src/constants/messages';
import { KeyToken } from 'src/constants/types/KeyToken';
import { Created, SuccessResponse } from 'src/helpers/core/success.response';
import AuthService from 'src/services/auth.service';

class AuthController {
  static signUp: RequestHandler = async (req, res) => {
    return new Created({
      message: AUTH_MESSAGES.SIGNUP_SUCCESS,
      metadata: await AuthService.signUp(req.body),
    }).send(res);
  };

  static login: RequestHandler = async (req, res) => {
    const { body, cookies } = req;

    return new SuccessResponse({
      message: AUTH_MESSAGES.LOGIN_SUCCESS,
      metadata: await AuthService.login({
        ...body,
        refreshToken: cookies.refreshToken || null,
      }),
    }).send(res);
  };

  static logout: RequestHandler = async (req, res) => {
    const keyStored = (req as any).keyStored as KeyToken;

    return new SuccessResponse({
      message: AUTH_MESSAGES.LOGOUT_SUCCESS,
      metadata: await AuthService.logout(keyStored),
    }).send(res);
  };

  static refreshToken: RequestHandler = async (req, res) => {
    const { cookies } = req;

    return new SuccessResponse({
      message: AUTH_MESSAGES.REFRESH_TOKEN_SUCCESS,
      metadata: await AuthService.getRefreshToken(cookies.refreshToken || null),
    }).send(res);
  };
}

export default AuthController;
