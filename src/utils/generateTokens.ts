import JWT from 'jsonwebtoken';
export const generateTokens = async (
  payload: object | string,
  publicKey: string,
  privateKey: string,
) => {
  try {
    // generate tokens
    const accessToken = await JWT.sign(payload, publicKey, {
      expiresIn: '2 days',
    });
    const refreshToken = await JWT.sign(payload, privateKey, {
      expiresIn: '7 days',
    });

    // verify tokens
    JWT.verify(accessToken, publicKey, (err, decode) => {
      if (err) {
        console.error('ERROR: verify token::', err);
      } else {
        console.log('decode token::', decode);
      }
    });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error('ERROR: createTokenPair::', error);
    return { accessToken: null, refreshToken: null };
  }
};
