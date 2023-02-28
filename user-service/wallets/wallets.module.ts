import { Module } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { WalletsController } from './wallets.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { config } from 'src/common/utils/config';
import { AUTH_SERVICE, PAYMENT_SERVICE } from 'src/common/constants';

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
  providers: [WalletsService],
  controllers: [WalletsController],
})
export class WalletModule { }
