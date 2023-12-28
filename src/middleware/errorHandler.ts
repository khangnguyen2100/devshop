import { ErrorRequestHandler } from 'express';
import configEnv from 'src/configs/config.env';

/**
 * 500 response & log when errors are raised.
 */
const errorHandler: ErrorRequestHandler = (err, _req, res) => {
  console.error(err);
  return res.status(500).json({
    message: configEnv.nodeEnv === 'production' ? 'unknown error' : `${err}`,
  });
};

export default errorHandler;
