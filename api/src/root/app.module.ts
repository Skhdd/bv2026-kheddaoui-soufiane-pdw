import { DynamicModule, Module } from '@nestjs/common';

import { ApiModule } from '@common/api';
import { AppConfigModule } from '@common/config';
import { DatabaseModule } from '@common/database';
import { ApplicationLifecycleLogger, LoggingModule } from '@common/logging';
import { AccountModule } from '@core/account';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({})
export class AppModule {
  static register(): DynamicModule {
    return {
      module: AppModule,
      imports: [
        AppConfigModule.register(),
        LoggingModule,
        ApiModule,
        DatabaseModule,
        AccountModule,
      ],
      controllers: [AppController],
      providers: [AppService, ApplicationLifecycleLogger],
    };
  }
}
