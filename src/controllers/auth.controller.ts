import { RequestHandler } from 'express';
import { AUTH_MESSAGES } from 'src/constants/messages';
import { Created, SuccessResponse } from 'src/helpers/core/success.response';
import AuthService from 'src/services/auth.service';
import { clearJWTCookies, getJWTCookies } from 'src/utils/cookieJWT';
import getKeyStored from 'src/utils/getKeyStored';

class AuthController {
  static signUp: RequestHandler = async (req, res) => {
    return new Created({
      message: AUTH_MESSAGES.SIGNUP_SUCCESS,
      metadata: await AuthService.signUp(req.body, res),
    }).send(res);
  };

  static login: RequestHandler = async (req, res) => {
    return new SuccessResponse({
      message: AUTH_MESSAGES.LOGIN_SUCCESS,
      metadata: await AuthService.login(req.body, res),
    }).send(res);
  };

  static logout: RequestHandler = async (req, res) => {
    const keyStored = getKeyStored(req);
    // clear cookies
    clearJWTCookies(res);
    return new SuccessResponse({
      message: AUTH_MESSAGES.LOGOUT_SUCCESS,
      metadata: await AuthService.logout(keyStored),
    }).send(res);
  };

  static refreshToken: RequestHandler = async (req, res) => {
    const cookies = getJWTCookies(req);

    return new SuccessResponse({
      message: AUTH_MESSAGES.REFRESH_TOKEN_SUCCESS,
      metadata: await AuthService.getRefreshToken(
        cookies.refreshToken || null,
        res,
      ),
    }).send(res);
  };
}

export default AuthController;
