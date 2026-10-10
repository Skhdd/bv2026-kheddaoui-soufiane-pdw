import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AppMode, ConfigKey, DatabaseType, LogLevel } from './data/enum';
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
  get databaseType(): DatabaseType {
    return this.get(ConfigKey.DbType);
  }

  get databaseHost(): string {
    return this.get(ConfigKey.DbHost);
  }

  get databasePort(): number {
    return this.get(ConfigKey.DbPort);
  }

  get databaseUser(): string {
    return this.get(ConfigKey.DbUser);
  }

  get databasePassword(): string {
    return this.get(ConfigKey.DbPassword);
  }

  get databaseName(): string {
    return this.get(ConfigKey.DbDatabase);
  }

  get databaseSynchronize(): boolean {
    return this.get(ConfigKey.DbSync);
  }

  get databaseMigration(): boolean {
    return this.get(ConfigKey.DbMigration);
  }

  get databaseLogging(): boolean {
    return this.get(ConfigKey.DbLog);
  }

  get databaseSchema(): string {
    return this.get(ConfigKey.DbSchema);
  }
  get isTest(): boolean {
    return this.appMode === AppMode.Test;
  }

  get<T extends keyof ValidatedEnvironment>(key: T): ValidatedEnvironment[T] {
    return this.configService.getOrThrow(key, { infer: true });
  }
}
