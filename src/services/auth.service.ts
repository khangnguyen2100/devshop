import bcrypt from 'bcryptjs';
import { Response } from 'express';
import lodash from 'lodash';
import { shopRole } from 'src/constants/enums/shop';
import { AUTH_MESSAGES, COMMON_MESSAGES } from 'src/constants/messages';
import { KeyToken } from 'src/constants/types/KeyToken';
import Shop from 'src/constants/types/Shop';
import storeTokens from 'src/helpers/auth/storeTokens';
import {
  BadRequestError,
  ForbiddenError,
  UnauthorizedError,
} from 'src/helpers/core/error.response';
import shopModel from 'src/models/shop.model';
import { generateTokens } from 'src/utils/generateTokens';
import { setJWTCookies } from 'src/utils/cookieJWT';

import KeyTokenService from './keyToken.service';

type SignUpBody = {
  name: string | null;
  email: string | null;
  password: string | null;
};
type LoginBody = {
  email: string | null;
  password: string | null;
  refreshToken: string | null;
};

class AuthService {
  static signUp = async (body: SignUpBody, res: Response) => {
    const { name, email, password } = body;

    if (!name || !email || !password) {
      throw new BadRequestError(COMMON_MESSAGES.MISSING_REQUIRED_FIELD);
    }
    // Check if email already exists
    const findShop = await shopModel.findOne({ email }).lean();
    if (findShop) {
      throw new BadRequestError(AUTH_MESSAGES.EMAIL_EXISTED);
    }

    // create new shop
    const newShop = await shopModel.create({
      name,
      email: email.toLowerCase(),
      password,
      roles: [shopRole.VIEW],
    });
    if (!newShop) {
      throw new BadRequestError(AUTH_MESSAGES.SIGNUP_ERROR);
    }

    // generate and store tokens
    const payload = {
      userId: newShop._id.toString(),
      email: newShop.email,
      roles: newShop.roles,
    };
    const { accessToken, refreshToken } = await storeTokens(
      payload,
      newShop._id.toString(),
    );
    // set refresh token to cookies
    setJWTCookies(res, refreshToken);

    return {
      data: lodash.pick(newShop, ['_id', 'name', 'email', 'roles']),
      accessToken,
    };
  };

  static login = async (body: LoginBody, res: Response) => {
    // Check inputs
    const { email: enteredEmail, password: enteredPassword } = body;
    if (!enteredEmail || !enteredPassword) {
      throw new BadRequestError(COMMON_MESSAGES.MISSING_REQUIRED_FIELD);
    }

    // Check if email in db
    const findShop = await shopModel
      .findOne({ email: enteredEmail })
      .select('+password')
      .lean();
    if (!findShop) {
      throw new UnauthorizedError(AUTH_MESSAGES.SHOP_NOT_REGISTERED);
    }

    // Compare password
    const isPwMatch = await bcrypt.compare(enteredPassword, findShop.password);
    if (!isPwMatch) {
      throw new UnauthorizedError(AUTH_MESSAGES.PASSWORD_INCORRECT);
    }

    // generate and store tokens
    const payload = {
      userId: findShop._id.toString(),
      email: findShop.email,
      roles: findShop.roles,
    };
    const { accessToken, refreshToken } = await storeTokens(
      payload,
      findShop._id.toString(),
    );
    // set refresh token to cookies
    setJWTCookies(res, refreshToken);

    return {
      data: lodash.pick(findShop, ['_id', 'name', 'email', 'roles']),
      accessToken,
    };
  };
  static logout = async (keyStored: KeyToken) => {
    const deletedKey = await KeyTokenService.removeById(keyStored._id);
    if (!deletedKey) {
      throw new BadRequestError(AUTH_MESSAGES.LOGOUT_ERROR);
    }
    return {};
  };
  static getRefreshToken = async (
    refreshToken: string | null,
    res: Response,
  ) => {
    if (!refreshToken)
      throw new BadRequestError('Your token is not found. Please login again.');

    const foundTokenUsed =
      await KeyTokenService.findByUsedRefreshToken(refreshToken);

    if (foundTokenUsed) {
      // this refresh token is being used => maybe this user is being hacked

      await KeyTokenService.removeById(foundTokenUsed._id);
      throw new ForbiddenError(
        'Something wrong happened. Please try login again.',
      );
    }
    // token is not used => check is stored in db or not
    const findKeyStored =
      await KeyTokenService.findByRefreshToken(refreshToken);
    if (!findKeyStored) {
      throw new UnauthorizedError(AUTH_MESSAGES.NOT_LOGGED_IN);
    }

    const shopInfo = findKeyStored.user as unknown as Shop;
    const payload = {
      userId: shopInfo._id.toString(),
      email: shopInfo.email,
      roles: shopInfo.roles,
    };
    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(
      payload,
      findKeyStored.publicKey, // public key to verify token
      findKeyStored.privateKey, // private key to sign token
    );

    // store token to db
    const publickeyStored = await KeyTokenService.createKeyToken({
      userId: shopInfo._id.toString(),
      publicKey: findKeyStored.publicKey,
      privateKey: findKeyStored.privateKey,
      refreshToken: newRefreshToken || undefined,
      refreshTokenUsed: refreshToken || undefined,
    });

    if (!publickeyStored || !newRefreshToken || !accessToken) {
      throw new BadRequestError('Create key token error');
    }
    // set refresh token to cookies
    setJWTCookies(res, newRefreshToken);

    return {
      user: payload,
      accessToken,
    };
  };
}
export default AuthService;
