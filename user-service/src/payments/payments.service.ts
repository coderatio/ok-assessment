import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PAYMENT_SERVICE } from 'src/common/constants';
import { RpcClient } from 'src/common/utils/rpc';

@Injectable()
export class PaymentsService {
    constructor(
        @Inject(PAYMENT_SERVICE)
        private readonly paymentClient: ClientProxy,
    ) { }
    async findAll(data): Promise<any> {
        return RpcClient.send(
            this.paymentClient,
            { role: 'payments', cmd: 'get' },
            data
        );
    }
}
