import { Logger, ValidationPipe } from '@nestjs/common';
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
    port: Number(config.microService.port),
  },
};

async function bootstrap() {
  const app = await NestFactory.createMicroservice(
    AppModule,
    microserviceOptions,
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(new ValidationPipe());
  app.listen().then(() => logger.log('Payment Microservice is listening'));

  const httpApp = await NestFactory.create(AppModule);
  httpApp.useGlobalFilters(new AllExceptionsFilter());
  httpApp.useGlobalPipes(new ValidationPipe());
  httpApp.listen(config.port);
}
bootstrap();
