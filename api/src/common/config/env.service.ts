import { Injectable } from '@nestjs/common';
import { ValidatedEnvironment } from './environment/environment.validation';
import { ConfigService } from '@nestjs/config';
import { AppMode, ConfigKey, LogLevel } from './data/enum';
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
