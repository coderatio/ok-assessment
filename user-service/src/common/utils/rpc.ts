import { Logger, RequestTimeoutException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { timeout, catchError, TimeoutError, throwError } from 'rxjs';

export class RpcClient {
    private readonly logger = new Logger('RpcClientError');

    static send(client: ClientProxy, pattern: any, data: any) {
        return new Promise((resolve) => {
            client
                .send(pattern, data)
                .pipe(
                    timeout(5000),
                    catchError((err) => {
                        console.log(err)
                        new RpcClient().logger.error(err.message, err);

                        if (err instanceof TimeoutError) {
                            return throwError(() => new RequestTimeoutException());
                        }
                        return throwError(() => new Error(err.message || 'Failed'));
                    }),
                )
                .subscribe((result) => resolve(result));
        });
    }
}
