import type { Types } from 'mongoose';

export type KeyToken = {
  _id: Types.ObjectId;
  user: string;
  publicKey: string;
  privateKey: string;
  refreshToken: string;
  refreshTokensUsed: string[];
  createdAt: Date;
  updatedAt: Date;
};
