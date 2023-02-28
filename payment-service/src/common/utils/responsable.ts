import { Response } from 'express';

export class Responsable {
  static sendSuccess(res: Response, message: string, data?: any) {
    res.status(200).json(this.createResponseObject('success', message, data));
  }

  static sendError(res: Response, message: string, status: number = 500) {
    res.status(status).json({
      status: 'failed',
      message,
    });
  }

  static sendRpcSuccess(message: string, data?: object) {
    return {
      error: false,
      message,
      data,
    };
  }

  static sendRpcError(message: string, code: number = 500) {
    return {
      error: true,
      message,
      code,
    };
  }

  private static createResponseObject(
    status: string = 'success',
    message: string = '',
    data: object,
  ) {
    return {
      status,
      message,
      data,
    };
  }
}
