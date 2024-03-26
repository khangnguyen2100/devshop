import JWT from 'jsonwebtoken';
import { JWTPayload } from 'src/constants/types/Shop';
import { UnauthorizedError } from 'src/helpers/core/error.response';

const verifyTokens = async (
  token: string,
  secretKey: string,
): Promise<JWTPayload | null> => {
  try {
    const data = JWT.verify(token, secretKey, (err, decode) => {
      if (err) throw new Error();
      return decode;
    }) as unknown as JWTPayload;
    return data;
  } catch (error: any) {
    throw new UnauthorizedError(
      'Token is invalid or expired! Please login again to get a new one.',
    );
  }
};

export default verifyTokens;
