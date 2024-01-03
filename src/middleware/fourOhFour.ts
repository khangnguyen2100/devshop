import { RequestHandler } from 'express';
import { ErrorResponse } from 'src/helpers/error.response';

/**
 * JSON 404 response
 */
const fourOhFour: RequestHandler = (_req, res, next) => {
  const error = new ErrorResponse('Not Found', 404);
  next(error);
};

export default fourOhFour;
