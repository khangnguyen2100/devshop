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
  data: any;
  options?: PaginationProps | null;
};

class SuccessResponse {
  message: string;
  status: number;
  data: any;
  options: PaginationProps | null;

  constructor({
    message = SuccessMessage.OK,
    status = StatusCode.OK,
    data = {},
    options = null,
  }: SuccessResponseProps) {
    this.status = status;
    this.message = message;
    this.data = data;
    this.options = options;
  }

  send(res: Response, header: object = {}) {
    const responseData: SuccessResponseProps = {
      status: this.status,
      message: this.message,
      data: this.data,
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
    data,
    options,
  }: SuccessResponseProps) {
    super({ message, data, status: StatusCode.OK, options });
  }
}

class Created extends SuccessResponse {
  constructor({
    message = SuccessMessage.Created,
    data,
  }: SuccessResponseProps) {
    super({ message, data, status: StatusCode.CREATED });
  }
}

export { Created, OK, SuccessResponse };
