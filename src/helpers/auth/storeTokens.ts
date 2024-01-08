import KeyTokenService from 'src/services/keyToken.service';
import generateKeys from 'src/utils/generateKeys';
import { generateTokens } from 'src/utils/generateTokens';

import { BadRequestError } from '../core/error.response';

interface StoreTokensPayload {
  userId: string;
  email: string;
  roles: string[];
}

const storeTokens = async (
  payload: StoreTokensPayload,
  _id: string,
  currentRefreshToken?: string | null,
) => {
  // generate key pair to use with this shop
  const { privateKey, publicKey } = generateKeys();

  // get access and refresh token with private key
  const { accessToken, refreshToken } = await generateTokens(
    payload,
    publicKey, // public key to verify token
    privateKey, // private key to sign token
  );

  // store token to db
  const publickeyStored = await KeyTokenService.createKeyToken({
    userId: _id,
    publicKey,
    privateKey,
    refreshToken: refreshToken || undefined,
    refreshTokenUsed: currentRefreshToken || undefined,
  });

  if (!publickeyStored) {
    throw new BadRequestError('Create key token error');
  }
  return {
    publickeyStored,
    accessToken,
    refreshToken,
  };
};
export default storeTokens;
