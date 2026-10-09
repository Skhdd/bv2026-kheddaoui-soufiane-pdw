import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';

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

  await app.listen(envService.appPort);
}

void bootstrap();
