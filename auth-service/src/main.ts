import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { config } from './common/utils/config';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';

const logger = new Logger('Main');

const microserviceOptions = {
  transport: Transport.TCP,
  options: {
    host: config.microService.host,
    port: config.microService.port,
  },
};

async function bootstrap() {
  const app = await NestFactory.createMicroservice(
    AppModule,
    microserviceOptions,
  );
  const httpApp = await NestFactory.create(AppModule);
  app.useGlobalFilters(new AllExceptionsFilter());
  httpApp.useGlobalFilters(new AllExceptionsFilter());
  app.listen().then(() => logger.log('Auth Microservice is listening...'));
  httpApp.listen(config.port);
}
bootstrap();
