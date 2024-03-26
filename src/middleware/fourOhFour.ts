import { RequestHandler } from 'express';
import { ErrorResponse } from 'src/helpers/core/error.response';

/**
 * JSON 404 response
 */
const fourOhFour: RequestHandler = (_req, res, next) => {
  const error = new ErrorResponse('Route Not found', 404);
  next(error);
};

export default fourOhFour;
