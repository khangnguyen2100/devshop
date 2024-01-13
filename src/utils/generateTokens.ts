import JWT from 'jsonwebtoken';
import configEnv from 'src/configs/config.env';
export const generateTokens = async (
  payload: object | string,
  publicKey: string,
  privateKey: string,
) => {
  try {
    // generate tokens
    const accessToken = await JWT.sign(payload, publicKey, {
      expiresIn: configEnv.accessTokenExpiresIn,
    });
    const refreshToken = await JWT.sign(payload, privateKey, {
      expiresIn: configEnv.refreshTokenExpiresIn,
    });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error('ERROR: createTokenPair::', error);
    return { accessToken: null, refreshToken: null };
  }
};
