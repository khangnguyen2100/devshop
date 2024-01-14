import { Request } from 'express';
import { AUTHENTICATION_MESSAGES } from 'src/constants/messages/middleware';
import { KeyToken } from 'src/constants/types/KeyToken';
import { UnauthorizedError } from 'src/helpers/core/error.response';

const getKeyStored = (req: Request) => {
  const keyStored = (req as any).keyStored as KeyToken;
  if (!keyStored)
    throw new UnauthorizedError(AUTHENTICATION_MESSAGES.NOT_LOGGED_IN);
  return keyStored;
};
export default getKeyStored;
