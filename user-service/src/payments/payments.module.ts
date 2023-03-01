import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AUTH_SERVICE, PAYMENT_SERVICE } from 'src/common/constants';
import { config } from 'src/common/utils/config';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';

@Module({
    imports: [
        ClientsModule.register([
            {
                name: PAYMENT_SERVICE,
                transport: Transport.TCP,
                options: config.paymentService,
            },
            {
                name: AUTH_SERVICE,
                transport: Transport.TCP,
                options: config.authService,
            },
        ]),
    ],
    providers: [PaymentsService],
    controllers: [PaymentsController]
})
export class PaymentsModule { }
