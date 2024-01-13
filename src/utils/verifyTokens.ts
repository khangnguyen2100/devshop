import JWT from 'jsonwebtoken';
import { LOGIN_MESSAGES } from 'src/constants/messages';
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
      const decodeData = decode as JWTPayload;
      if (decodeData?.userId !== userId || err) {
        throw new Error();
      }

      return decodeData;
    });
    return data;
  } catch (error: any) {
    throw new UnauthorizedError(LOGIN_MESSAGES.TOKEN_INVALID);
  }
};

export default verifyTokens;
