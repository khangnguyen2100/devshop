import { NextFunction, Request, Response } from 'express';
import { HEADER } from 'src/constants/enums/common';
import {
  BadRequestError,
  UnauthorizedError,
} from 'src/helpers/core/error.response';
import KeyTokenService from 'src/services/keyToken.service';
import verifyTokens from 'src/utils/verifyTokens';

import { asyncHandler } from './errorHandler';

const authentication = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // get user id
    const userId = req.headers[HEADER.CLIENT_ID] as string;
    if (!userId) throw new UnauthorizedError('User Id not found!');

    // get key stored from this user
    const keyStored = await KeyTokenService.findById(userId);
    if (!keyStored) throw new BadRequestError("You're not logged in yet!");

    // get access token
    const accessToken = req.headers[HEADER.AUTHORIZATION] as string;
    if (!accessToken) throw new UnauthorizedError('Token not found!');

    // verify token
    const payload = await verifyTokens({
      accessToken,
      publicKey: keyStored.publicKey,
      userId,
    });
    (req as any).keyStored = keyStored;
    console.log('payload:', payload);
    return next();
  },
);

export default authentication;
