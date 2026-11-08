import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  AuthIdentifierEntity,
  AuthRefreshTokenEntity,
  AuthSessionEntity,
  PasswordCredentialEntity,
} from './data';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AuthIdentifierEntity,
      PasswordCredentialEntity,
      AuthSessionEntity,
      AuthRefreshTokenEntity,
    ]),
  ],
})
export class AuthModule {}
