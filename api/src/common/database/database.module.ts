import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EnvService } from '@common/config';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [EnvService],
      useFactory: (envService: EnvService) => ({
        type: envService.databaseType,
        host: envService.databaseHost,
        port: envService.databasePort,
        username: envService.databaseUser,
        password: envService.databasePassword,
        database: envService.databaseName,
        schema: envService.databaseSchema,
        synchronize: envService.databaseSynchronize,
        migrationsRun: envService.databaseMigration,
        logging: envService.databaseLogging,
        autoLoadEntities: true,
      }),
    }),
  ],
})
export class DatabaseModule {}
