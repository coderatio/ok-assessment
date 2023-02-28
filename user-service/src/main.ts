import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { Transport } from '@nestjs/microservices';
import { config } from './common/utils/config';

const logger = new Logger('Main');

const microserviceOptions = {
  transport: Transport.TCP,
  options: {
    host: config.microServiceOptions.host,
    port: config.microServiceOptions.port,
  },
};

async function bootstrap() {
  const app = await NestFactory.createMicroservice(
    AppModule,
    microserviceOptions,
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.listen().then(() => logger.log('User Microservice is listening'));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  const httpApp = await NestFactory.create(AppModule);
  httpApp.useGlobalFilters(new AllExceptionsFilter());
  httpApp.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  httpApp.listen(config.port);
}
bootstrap();
