import bcrypt from 'bcryptjs';
import lodash from 'lodash';
import { shopRole } from 'src/constants/enums/shop';
import {
  COMMON,
  LOGIN_MESSAGES,
  LOGOUT_MESSAGES,
  SIGNUP_MESSAGES,
} from 'src/constants/messages';
import { KeyToken } from 'src/constants/types/KeyToken';
import storeTokens from 'src/helpers/auth/storeTokens';
import {
  BadRequestError,
  UnauthorizedError,
} from 'src/helpers/core/error.response';
import shopModel from 'src/models/shop.model';

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
  static signUp = async (body: SignUpBody) => {
    const { name, email, password } = body;

    if (!name || !email || !password) {
      throw new BadRequestError(COMMON.MISSING_REQUIRED_FIELD);
    }
    // Check if email already exists
    const findShop = await shopModel.findOne({ email }).lean();
    if (findShop) {
      throw new BadRequestError(SIGNUP_MESSAGES.EMAIL_EXISTED);
    }

    // create new shop
    const newShop = await shopModel.create({
      name,
      email: email.toLowerCase(),
      password,
      roles: [shopRole.VIEW],
    });
    if (!newShop) {
      throw new BadRequestError(SIGNUP_MESSAGES.ERROR);
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

    return {
      data: lodash.pick(newShop, ['_id', 'name', 'email', 'roles']),
      accessToken,
      refreshToken,
    };
  };

  static login = async (body: LoginBody) => {
    // Check inputs
    const {
      email: enteredEmail,
      password: enteredPassword,
      refreshToken: currentRefreshToken,
    } = body;
    if (!enteredEmail || !enteredPassword) {
      throw new BadRequestError(COMMON.MISSING_REQUIRED_FIELD);
    }

    // Check if email in db
    const findShop = await shopModel
      .findOne({ email: enteredEmail })
      .select('+password')
      .lean();
    if (!findShop) {
      throw new UnauthorizedError(LOGIN_MESSAGES.EMAIL_NOT_REGISTERED);
    }

    // Compare password
    const isPwMatch = await bcrypt.compare(enteredPassword, findShop.password);
    if (!isPwMatch) {
      throw new UnauthorizedError(LOGIN_MESSAGES.PASSWORD_INCORRECT);
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
      currentRefreshToken,
    );

    return {
      data: lodash.pick(findShop, ['_id', 'name', 'email', 'roles']),
      accessToken,
      refreshToken,
    };
  };
  static logout = async (keyStored: KeyToken) => {
    const deletedKey = await KeyTokenService.removeById(keyStored._id);
    if (!deletedKey) {
      throw new BadRequestError(LOGOUT_MESSAGES.ERROR);
    }
    return {};
  };
}
export default AuthService;
