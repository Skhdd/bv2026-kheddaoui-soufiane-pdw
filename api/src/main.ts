import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';

import { setupSwagger, ValidationException } from '@common/api';
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
  setupSwagger(app, envService);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      exceptionFactory: (errors) =>
        ValidationException.fromClassValidatorErrors(
          errors,
          envService.appHttpPayloadErrorCode,
        ),
    }),
  );

  await app.listen(envService.appPort);
}

void bootstrap();
