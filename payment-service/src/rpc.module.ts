import { Module } from '@nestjs/common';
import { PaymentScheduleService } from './schedule/payment-schedule.service';
import { ScheduleModule } from '@nestjs/schedule';
import { appModuleOptions } from 'src/app.module';
import { MongooseModule } from '@nestjs/mongoose';
import { modelsDefinitions } from './common/utils/mongoose';
import { RefundScheduleService } from './schedule/refund-schedule.service';

const mainAppModuleOptions = appModuleOptions;

@Module({
  imports: mainAppModuleOptions.imports.concat([
    ScheduleModule.forRoot(),
    MongooseModule.forFeature(modelsDefinitions),
  ]),
  providers: [PaymentScheduleService, RefundScheduleService],
})
export class RpcAppModule {}
