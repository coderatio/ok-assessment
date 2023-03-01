import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PaymentModule } from './payment/payment.module';
import { WalletModule } from './wallets/wallets.module';
import { RpcAppModule } from './rpc.module';

export const appModuleOptions = {
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    WalletModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
};

@Module(appModuleOptions)
export class AppModule {}
