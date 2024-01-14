import { Request } from 'express';
import { KeyToken } from 'src/constants/types/KeyToken';

const getKeyStored = (req: Request) => {
  const keyStored = (req as any).keyStored as KeyToken;
  return keyStored;
};
export default getKeyStored;
