import { RequestHandler } from 'express';
import { Created, SuccessResponse } from 'src/helpers/core/success.response';
import AuthService from 'src/services/auth.service';
import { clearJWTCookies, getJWTCookies } from 'src/utils/cookieJWT';
import getKeyStored from 'src/utils/getKeyStored';
import { yupObject } from 'src/utils/validate';
import * as Yup from 'yup';
class AuthController {
  static signUpSchema = yupObject({
    body: yupObject({
      email: Yup.string().email().required(),
      password: Yup.string().min(6).max(20).required(),
      name: Yup.string().required(),
      username: Yup.string().required(),
    }),
  });
  static signUp: RequestHandler = async (req, res) => {
    return new Created({
      message: 'Shop created successfully!',
      data: await AuthService.signUp(req.body, res),
    }).send(res);
  };

  static loginSchema = yupObject({
    body: yupObject({
      email: Yup.string().email().required(),
      password: Yup.string().min(6).max(20).required(),
    }),
  });
  static login: RequestHandler = async (req, res) => {
    return new SuccessResponse({
      message: 'Login successful',
      data: await AuthService.login(req.body, res),
    }).send(res);
  };

  static logout: RequestHandler = async (req, res) => {
    const keyStored = getKeyStored(req);
    // clear cookies
    clearJWTCookies(res);
    return new SuccessResponse({
      message: 'Logout successful',
      data: await AuthService.logout(keyStored),
    }).send(res);
  };

  static refreshToken: RequestHandler = async (req, res) => {
    const cookies = getJWTCookies(req);

    return new SuccessResponse({
      message: 'Create refresh token successfully!',
      data: await AuthService.getRefreshToken(
        cookies.refreshToken || null,
        res,
      ),
    }).send(res);
  };
}

export default AuthController;
