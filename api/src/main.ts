import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';

import { ValidationException } from '@common/api';
import { EnvService } from '@common/config';
import { AppModule } from '@root/app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule.register(), {
    bufferLogs: true,
  });

  app.useLogger(app.get(Logger));
  app.flushLogs();

  app.enableShutdownHooks();

  const envService = app.get(EnvService);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,

      exceptionFactory: (errors) =>
        ValidationException.fromClassValidatorErrors(
          errors,
          envService.appHttpPayloadErrorCode as HttpStatus,
        ),
    }),
  );

  await app.listen(envService.appPort);
}

void bootstrap();
