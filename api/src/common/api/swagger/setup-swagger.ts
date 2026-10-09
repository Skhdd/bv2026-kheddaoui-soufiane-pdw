import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { EnvService } from '@common/config';

export const setupSwagger = (
  app: INestApplication,
  envService: EnvService,
): void => {
  if (!envService.swaggerEnabled) {
    return;
  }

  const config = new DocumentBuilder()
    .setTitle(envService.swaggerTitle)
    .setDescription(envService.swaggerDescription)
    .setVersion(envService.swaggerVersion)
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(envService.swaggerPath, app, document);
};
