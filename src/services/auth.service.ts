import crypto from 'node:crypto';

import lodash from 'lodash';
import { shopRole } from 'src/constants/enums/shop';
import { createTokenPair } from 'src/helpers/createTokenPair';
import { BadRequestError } from 'src/helpers/error.response';
import shopModel from 'src/models/shop.model';

import keyTokenService from './keyToken.service';

class AuthService {
  static signUp = async (body: any) => {
    try {
      const { name, email, password } = body;

      if (!name || !email || !password) {
        throw new BadRequestError('Missing required fields', 401);
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
      const publicKey = crypto.randomBytes(64).toString('hex');
      const privateKey = crypto.randomBytes(64).toString('hex');

      // store token to db
      const publickeyStored = await keyTokenService.createKeyToken({
        userId: newShop._id.toString(),
        publicKey,
        privateKey,
      });
      if (!publickeyStored) {
        throw new BadRequestError('Create key token error');
      }

      // get access and refresh token with private key
      const { accessToken, refreshToken } = await createTokenPair(
        { userId: newShop._id.toString(), email: newShop.email },
        publickeyStored, // public key to verify token
        privateKey, // private key to sign token
      );

      return {
        code: 201,
        message: 'Shop created successfully',
        data: lodash.pick(newShop, ['_id', 'name', 'email', 'roles']),
        accessToken,
        refreshToken,
      };
    } catch (error: any) {
      console.log('signUp error:', error);
      throw new BadRequestError(error.message);
      return null;
    }
  };
}
export default AuthService;
