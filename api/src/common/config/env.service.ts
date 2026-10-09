import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AppMode, ConfigKey, LogLevel } from './data/enum';
import { ValidatedEnvironment } from './environment/environment.validation';

@Injectable()
export class EnvService {
  constructor(
    private readonly configService: ConfigService<ValidatedEnvironment, true>,
  ) {}

  get appMode(): AppMode {
    return this.get(ConfigKey.NodeEnv);
  }

  get appPort(): number {
    return this.get(ConfigKey.AppPort);
  }

  get appName(): string {
    return this.get(ConfigKey.AppName);
  }

  get appBaseUrl(): string {
    return this.get(ConfigKey.AppBaseUrl);
  }

  get appCorsOrigin(): string {
    return this.get(ConfigKey.AppCorsOrigin);
  }

  get appTrustProxy(): boolean {
    return this.get(ConfigKey.AppTrustProxy);
  }

  get appHttpPayloadErrorCode(): number {
    return this.get(ConfigKey.AppHttpPayloadErrorCode);
  }

  get logLevel(): LogLevel {
    return this.get(ConfigKey.LogLevel);
  }

  get swaggerEnabled(): boolean {
    return this.get(ConfigKey.SwaggerEnabled);
  }

  get swaggerTitle(): string {
    return this.get(ConfigKey.SwaggerTitle);
  }

  get swaggerDescription(): string {
    return this.get(ConfigKey.SwaggerDescription);
  }

  get swaggerVersion(): string {
    return this.get(ConfigKey.SwaggerVersion);
  }

  get swaggerPath(): string {
    return this.get(ConfigKey.SwaggerPath);
  }

  get isProduction(): boolean {
    return this.appMode === AppMode.Prod;
  }

  get isTest(): boolean {
    return this.appMode === AppMode.Test;
  }

  get<T extends keyof ValidatedEnvironment>(key: T): ValidatedEnvironment[T] {
    return this.configService.getOrThrow(key, { infer: true });
  }
}
