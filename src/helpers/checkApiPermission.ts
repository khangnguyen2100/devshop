import { RequestHandler } from 'express';
import apikeyService from 'src/services/apikey.service';

const HEADER = {
  API_KEY: 'x-api-key',
  AUTHORIZATION: 'authorization',
};

export const checkApiKey: RequestHandler = async (req, res, next) => {
  try {
    // check api key in header
    const key = req.headers[HEADER.API_KEY]?.toString();
    if (!key) {
      return res.status(403).json({
        message: 'Forbidden',
      });
    }

    // check api key in db
    const apiKey = await apikeyService.findApiKey(key);
    if (!apiKey) {
      return res.status(403).json({
        message: 'Forbidden',
      });
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
      return res.status(403).json({
        message: 'Permission denied',
      });
    }
    return next();
  };
};
