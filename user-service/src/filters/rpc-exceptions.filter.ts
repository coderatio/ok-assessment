import {
  Catch,
  RpcExceptionFilter,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Catch(RpcException)
export class AllRpcExceptionFilter implements RpcExceptionFilter<RpcException> {
  catch(exception: RpcException, host: ArgumentsHost): Observable<any> {
    return throwError(() => {
      return {
        error: true,
        message: exception.message,
        code: HttpStatus.BAD_GATEWAY,
      };
    });
  }
}
