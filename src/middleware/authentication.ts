import { NextFunction, Request, Response } from 'express';
import { HEADER } from 'src/constants/enums/common';
import { AUTHENTICATION_MESSAGES } from 'src/constants/messages/middleware';
import {
  BadRequestError,
  UnauthorizedError,
} from 'src/helpers/core/error.response';
import KeyTokenService from 'src/services/keyToken.service';
import verifyTokens from 'src/utils/verifyTokens';
import { AUTH_MESSAGES } from 'src/constants/messages';

import { asyncHandler } from './errorHandler';

const authentication = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // get user id
    const userId = req.headers[HEADER.CLIENT_ID] as string;
    if (!userId)
      throw new UnauthorizedError(AUTHENTICATION_MESSAGES.USERID_NOT_FOUND);

    // get key stored from this user
    const keyStored = await KeyTokenService.findById(userId);
    if (!keyStored)
      throw new BadRequestError(AUTHENTICATION_MESSAGES.NOT_LOGGED_IN);

    const authHeader = req.headers[HEADER.AUTHORIZATION] as string;
    if (!authHeader?.startsWith('Bearer '))
      throw new BadRequestError('Invalid token method');
    const accessToken = authHeader.split(' ')[1];

    if (!accessToken) {
      throw new UnauthorizedError(AUTHENTICATION_MESSAGES.TOKEN_NOT_FOUND);
    }

    // verify token
    const decodeData = await verifyTokens(accessToken, keyStored.publicKey);
    // check token is this user
    if (decodeData?.userId !== userId) {
      throw new Error(AUTH_MESSAGES.TOKEN_INVALID);
    }

    (req as any).keyStored = {
      ...keyStored,
      user: keyStored.user.toString(),
    };
    return next();
  },
);

export default authentication;
