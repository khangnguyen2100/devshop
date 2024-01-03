const StatusCode = {
  BadRequest: 400,
  Unauthorized: 401,
  Forbidden: 403,
  NotFound: 404,
  InternalServerError: 500,
};
const ErrorMessage = {
  BadRequest: 'Bad Request',
  Unauthorized: 'Unauthorized',
  Forbidden: 'Forbidden',
  NotFound: 'Not Found',
  InternalServerError: 'Internal Server Error',
};

class ErrorResponse extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

class BadRequestError extends ErrorResponse {
  constructor(
    message = ErrorMessage.BadRequest,
    statusCode = StatusCode.BadRequest,
  ) {
    super(message, statusCode);
  }
}

class UnauthorizedError extends ErrorResponse {
  constructor(
    message = ErrorMessage.Unauthorized,
    statusCode = StatusCode.Unauthorized,
  ) {
    super(message, statusCode);
  }
}

class ForbiddenError extends ErrorResponse {
  constructor(
    message = ErrorMessage.Forbidden,
    statusCode = StatusCode.Forbidden,
  ) {
    super(message, statusCode);
  }
}

class NotFoundError extends ErrorResponse {
  constructor(
    message = ErrorMessage.NotFound,
    statusCode = StatusCode.NotFound,
  ) {
    super(message, statusCode);
  }
}

export {
  ErrorResponse,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
};
