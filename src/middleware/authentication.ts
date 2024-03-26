import { NextFunction, Request, Response } from 'express';
import { HEADER } from 'src/constants/enums/common';
import {
  BadRequestError,
  UnauthorizedError,
} from 'src/helpers/core/error.response';
import KeyTokenService from 'src/services/keyToken.service';
import verifyTokens from 'src/utils/verifyTokens';
import { shopRole } from 'src/constants/enums/shop';

import { asyncHandler } from './errorHandler';

const shopAuthentication = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // get user id
    const userId = req.headers[HEADER.CLIENT_ID] as string;
    if (!userId) throw new UnauthorizedError('User Id not found!');

    // get key stored from this user
    const keyStored = await KeyTokenService.findById(userId);
    if (!keyStored) throw new BadRequestError('You are not logged in yet!');

    const authHeader = req.headers[HEADER.AUTHORIZATION] as string;
    if (!authHeader?.startsWith('Bearer '))
      throw new BadRequestError('Invalid token method');
    const accessToken = authHeader.split(' ')[1];

    if (!accessToken) {
      throw new UnauthorizedError('Token not found!');
    }

    // verify token
    const decodeData = await verifyTokens(accessToken, keyStored.publicKey);
    console.log('decodeData:', decodeData);
    // check token is this user
    if (decodeData?.userId !== userId) {
      throw new Error(
        'Token is invalid or expired! Please login again to get a new one.',
      );
    }
    // block when account is role user
    const userRoles = decodeData.roles;
    if (
      userRoles.includes(shopRole.USER) &&
      (!userId.includes(shopRole.SUPPER_ADMIN) ||
        userId.includes(shopRole.SHOP))
    ) {
      throw new UnauthorizedError('You are not a shop account');
    }
    (req as any).keyStored = {
      ...keyStored,
      user: keyStored.user.toString(),
    };
    return next();
  },
);

export default shopAuthentication;
