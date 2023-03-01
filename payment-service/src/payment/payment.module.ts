import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { AUTH_SERVICE } from 'src/common/constants';
import { config } from 'src/common/utils/config';
import { modelsDefinitions } from 'src/common/utils/mongoose';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { VerifyPaymentService } from './verify-payment.service';

@Module({
  imports: [
    MongooseModule.forFeature(modelsDefinitions),
    ClientsModule.register([
      {
        name: AUTH_SERVICE,
        transport: Transport.TCP,
        options: config.authService,
      },
    ]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService, VerifyPaymentService],
})
export class PaymentModule {}
