import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleModule } from '@nestjs/schedule';
import { appModuleOptions } from 'src/app.module';
import { MongooseModule } from '@nestjs/mongoose';
import { modelsDefinitions } from './common/utils/mongoose';

const mainAppModuleOptions = appModuleOptions

@Module({
  imports: mainAppModuleOptions.imports.concat([
    ScheduleModule.forRoot(),
    MongooseModule.forFeature(modelsDefinitions)
  ]),
  providers: [ScheduleService]
})
export class RpcAppModule { }
