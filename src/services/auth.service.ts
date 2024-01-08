import bcrypt from 'bcryptjs';
import lodash from 'lodash';
import { shopRole } from 'src/constants/enums/shop';
import { createTokenPair } from 'src/helpers/createTokenPair';
import { BadRequestError, UnauthorizedError } from 'src/helpers/error.response';
import shopModel from 'src/models/shop.model';
import createKeyTokens from 'src/utils/createKeyTokens';

import keyTokenService from './keyToken.service';

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
      throw new BadRequestError('Missing required fields');
    }
    // Check if email already exists
    const findShop = await shopModel.findOne({ email }).lean();
    if (findShop) {
      throw new BadRequestError('Email already exists');
    }

    // create new shop
    const newShop = await shopModel.create({
      name,
      email: email.toLowerCase(),
      password,
      roles: [shopRole.VIEW],
    });
    if (!newShop) {
      throw new BadRequestError('Create shop error');
    }

    // generate key pair to use with this shop
    const { privateKey, publicKey } = createKeyTokens();

    // get access and refresh token with private key
    const { accessToken, refreshToken } = await createTokenPair(
      { userId: newShop._id.toString(), email: newShop.email },
      publicKey, // public key to verify token
      privateKey, // private key to sign token
    );

    // store token to db
    const publickeyStored = await keyTokenService.createKeyToken({
      userId: newShop._id.toString(),
      publicKey,
      privateKey,
      refreshToken: refreshToken || undefined,
    });
    if (!publickeyStored) {
      throw new BadRequestError('Create key token error');
    }

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
      throw new BadRequestError('Missing required fields');
    }

    // Check if email in db
    const findShop = await shopModel
      .findOne({ email: enteredEmail })
      .select('+password')
      .lean();
    if (!findShop) {
      throw new UnauthorizedError('Email are not registered');
    }

    // Compare password
    const isPwMatch = await bcrypt.compare(enteredPassword, findShop.password);
    if (!isPwMatch) {
      throw new UnauthorizedError('Password is incorrect');
    }

    // generate key pair to use with this shop
    const { privateKey, publicKey } = createKeyTokens();

    // Create AT, RT and save to db
    const { accessToken, refreshToken } = await createTokenPair(
      { userId: findShop._id.toString(), email: findShop.email },
      publicKey, // public key to verify token
      privateKey, // private key to sign token
    );

    // store token to db
    const publickeyStored = await keyTokenService.createKeyToken({
      userId: findShop._id.toString(),
      publicKey,
      privateKey,
      refreshToken: refreshToken || undefined,
      refreshTokenUsed: currentRefreshToken || undefined,
    });

    if (!publickeyStored) {
      throw new BadRequestError('Stored key token error');
    }

    return {
      data: lodash.pick(findShop, ['_id', 'name', 'email', 'roles']),
      accessToken,
      refreshToken,
    };
  };
}
export default AuthService;
