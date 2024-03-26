import { Request } from 'express';
import { KeyToken } from 'src/constants/types/KeyToken';
import { UnauthorizedError } from 'src/helpers/core/error.response';

const getKeyStored = (req: Request) => {
  const keyStored = (req as any).keyStored as KeyToken;
  if (!keyStored) throw new UnauthorizedError('You are not logged in yet!');
  return keyStored;
};
export default getKeyStored;
