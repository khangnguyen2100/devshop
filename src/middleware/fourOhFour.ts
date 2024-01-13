import { RequestHandler } from 'express';
import COMMON_MESSAGES from 'src/constants/messages/common';
import { ErrorResponse } from 'src/helpers/core/error.response';

/**
 * JSON 404 response
 */
const fourOhFour: RequestHandler = (_req, res, next) => {
  const error = new ErrorResponse(COMMON_MESSAGES.NOT_FOUND, 404);
  next(error);
};

export default fourOhFour;
