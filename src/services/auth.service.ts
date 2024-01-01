import crypto from 'node:crypto';

import lodash from 'lodash';
import { shopRole } from 'src/constants/enums/shop';
import { createTokenPair } from 'src/helpers/createTokenPair';
import shopModel from 'src/models/shop.model';

import keyTokenService from './keyToken.service';

class AuthService {
  signUp = async (body: any) => {
    try {
      const { name, email, password } = body;

      // Check if email already exists
      const findShop = await shopModel.findOne({ email }).lean();
      if (findShop) {
        return {
          code: 400,
          message: 'Email already exists',
        };
      }

      // create new shop
      const newShop = await shopModel.create({
        name,
        email: email.toLowerCase(),
        password,
        roles: [shopRole.VIEW],
      });
      if (!newShop) {
        return {
          code: 400,
          message: 'Cannot create new shop',
        };
      }

      // generate key pair to use with this shop
      const publicKey = crypto.randomBytes(64).toString('hex');
      console.log('publicKey:', publicKey);
      const privateKey = crypto.randomBytes(64).toString('hex');
      console.log('privateKey:', privateKey);

      // store token to db
      const publickeyStored = await keyTokenService.createKeyToken({
        userId: newShop._id.toString(),
        publicKey,
        privateKey,
      });
      if (!publickeyStored) {
        return {
          code: 400,
          message: 'store token error',
        };
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
      console.log('error:', error);
      return { message: error.message };
    }
  };
}
export default new AuthService();
