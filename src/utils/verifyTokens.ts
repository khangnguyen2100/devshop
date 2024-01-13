import JWT from 'jsonwebtoken';
import { JWTPayload } from 'src/constants/types/Shop';
import { UnauthorizedError } from 'src/helpers/core/error.response';

type Props = {
  accessToken: string;
  publicKey: string;
  userId: string;
};

const verifyTokens = async ({ accessToken, publicKey, userId }: Props) => {
  try {
    const data = JWT.verify(accessToken, publicKey, (err, decode) => {
      // check token is invalid or expired
      if (err) {
        console.log('err:', err);
        throw new Error(err.message);
      }
      const decodeData = decode as JWTPayload;
      if (decodeData?.userId !== userId) {
        throw new Error(
          'Token is invalid! Please login again to get a new one.',
        );
      }
      console.log('decodeData:', decodeData);
      return decodeData;
    });
    return data;
  } catch (error: any) {
    throw new UnauthorizedError(error.message);
  }
};

export default verifyTokens;
