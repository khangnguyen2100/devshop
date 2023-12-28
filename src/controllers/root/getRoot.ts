import { RequestHandler } from 'express';
import configEnv from 'src/configs/config.env';

/**
 * Health check endpoint
 */
const getRoot: RequestHandler = (_req, res) => {
  res.status(200).json({
    name: configEnv.name,
    description: configEnv.description,
    version: configEnv.version,
  });
};

export default getRoot;
