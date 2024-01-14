import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { COMMON_MESSAGES } from 'src/constants/messages';

/**
 * 500 response & log when errors are raised.
 */
const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  const statusCode = err?.status || 500;
  console.error('ERR errorHandler::', err);
  return res.status(statusCode).json({
    code: statusCode,
    message: err.message || COMMON_MESSAGES.INTERNAL_SERVER_ERROR,
  });
};

const asyncHandler = (fn: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export { asyncHandler, errorHandler };
