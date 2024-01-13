import { NextFunction, Request, Response } from 'express';
import { HEADER } from 'src/constants/enums/common';
import {
  BadRequestError,
  UnauthorizedError,
} from 'src/helpers/core/error.response';
import KeyTokenService from 'src/services/keyToken.service';
import verifyTokens from 'src/utils/verifyTokens';
import { AUTHENTICATION_MESSAGES } from 'src/constants/messages/middleware';

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

    // get access token
    const accessToken = req.headers[HEADER.AUTHORIZATION] as string;
    if (!accessToken)
      throw new UnauthorizedError(AUTHENTICATION_MESSAGES.TOKEN_NOT_FOUND);

    // verify token
    await verifyTokens({
      accessToken,
      publicKey: keyStored.publicKey,
      userId,
    });

    (req as any).keyStored = keyStored;
    return next();
  },
);

export default authentication;
