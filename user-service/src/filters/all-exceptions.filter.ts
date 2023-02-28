import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Error } from 'mongoose';
import ValidationError = Error.ValidationError;

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('AppError');

  catch(exception: InternalServerErrorException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception instanceof ValidationError) {
      status = 400;
    }

    if (exception instanceof ForbiddenException) {
      status = 401;
    }

    this.logger.error(exception);

    /**
     * @description Exception json response
     * @param message
     */
    const responseMessage = (type: string, message: any) => {
      response.status(status).json({
        status: 'failed',
        code: status,
        path: request.url,
        type: type,
        message: message,
      });
    };

    if (exception instanceof BadRequestException) {
      const errors = (exception.getResponse() as any)?.message;
      return responseMessage('ValidationError', { errors });
    }

    // MongoError, ValidationError, TypeError, CastError and Error
    const newException = exception as any;
    if (newException.message.error) {
      responseMessage('Error', newException.message.error);
    } else {
      responseMessage(exception.name, exception.message);
    }
  }
}
