import { Response } from 'express';

const StatusCode = {
  OK: 200,
  CREATED: 201,
};
const SuccessMessage = {
  OK: 'Success',
  Created: 'Created',
};
type PaginationProps = {
  limit: number;
  page: number;
  total: number;
};
type SuccessResponseProps = {
  message?: string;
  status?: number;
  metadata: any;
  options?: PaginationProps | null;
};

class SuccessResponse {
  message: string;
  status: number;
  metadata: any;
  options: PaginationProps | null;

  constructor({
    message = SuccessMessage.OK,
    status = StatusCode.OK,
    metadata = {},
    options = null,
  }: SuccessResponseProps) {
    this.status = status;
    this.message = message;
    this.metadata = metadata;
    this.options = options;
  }

  send(res: Response, header: object = {}) {
    const responseData: SuccessResponseProps = {
      status: this.status,
      message: this.message,
      metadata: this.metadata,
    };
    if (this.options) {
      responseData.options = this.options;
    }

    return res.status(this.status || 200).json(responseData);
  }
}

class OK extends SuccessResponse {
  constructor({
    message = SuccessMessage.OK,
    metadata,
    options,
  }: SuccessResponseProps) {
    super({ message, metadata, status: StatusCode.OK, options });
  }
}

class Created extends SuccessResponse {
  constructor({
    message = SuccessMessage.Created,
    metadata,
  }: SuccessResponseProps) {
    super({ message, metadata, status: StatusCode.CREATED });
  }
}

export { Created, OK, SuccessResponse };
