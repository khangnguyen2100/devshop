import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';

/**
 * 500 response & log when errors are raised.
 */
const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  const statusCode = err?.status || 500;
  return res.status(statusCode).json({
    code: statusCode,
    message: err.message || 'Internal server error',
    stack: err.stack,
  });
};

const asyncHandler = (fn: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export { asyncHandler, errorHandler };
