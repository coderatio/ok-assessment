import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { AUTH_SERVICE } from 'src/common/constants';
import { config } from 'src/common/utils/config';
import {
  WalletHistory,
  WalletHistorySchema,
} from 'src/schemas/wallet-history.schema';
import { Wallet, WalletSchema } from 'src/schemas/wallet.schema';
import { WalletsController } from './wallets.controller';
import { WalletsService } from './wallets.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Wallet.name, schema: WalletSchema },
      { name: WalletHistory.name, schema: WalletHistorySchema },
    ]),
    ClientsModule.register([
      {
        name: AUTH_SERVICE,
        transport: Transport.TCP,
        options: config.authService,
      },
    ]),
  ],
  controllers: [WalletsController],
  providers: [WalletsService],
})
export class WalletModule {}
