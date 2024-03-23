import { RequestHandler } from 'express';
import { HEADER } from 'src/constants/enums/common';
import ApiKeyService from 'src/services/apikey.service';

import { ForbiddenError } from '../core/error.response';

export const checkApiKey: RequestHandler = async (req, res, next) => {
  try {
    // check api key in header
    const key = req.headers[HEADER.API_KEY]?.toString();
    console.log('key:', key)
    if (!key) {
      throw new ForbiddenError();
    }

    // check api key in db
    const apiKey = await ApiKeyService.findApiKey(key);
    if (!apiKey) {
      throw new ForbiddenError();
    }

    (req as any).apiKey = apiKey;
    return next();
  } catch (error) {
    console.log('error:', error);
    return res.status(500).json({
      message: 'Internal Server Error',
    });
  }
};

export const checkApiPermission = (permission: string): RequestHandler => {
  return async (req, res, next) => {
    const apiKey = (req as any).apiKey;

    if (!permission || !apiKey.permissions.includes(permission)) {
      throw new ForbiddenError('Permission denied');
    }
    return next();
  };
};
