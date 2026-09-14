import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './root/app.module.js';
import { ConfigKey } from './common/config/config.keys.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>(ConfigKey.AppPort);

  await app.listen(port ?? 3000);
  console.log(`l'application est éxecute sur http://localhost:${port}`);
}
bootstrap();
