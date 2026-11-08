import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  AuthIdentifierEntity,
  AuthRefreshTokenEntity,
  AuthSessionEntity,
  PasswordCredentialEntity,
} from './data';

import {
  OpaqueTokenService,
  PasswordHasherService,
  PasswordPolicyService,
  TokenCryptoService,
} from './security';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AuthIdentifierEntity,
      PasswordCredentialEntity,
      AuthSessionEntity,
      AuthRefreshTokenEntity,
    ]),
  ],
  providers: [
    OpaqueTokenService,
    PasswordHasherService,
    PasswordPolicyService,
    TokenCryptoService,
  ],
  exports: [
    OpaqueTokenService,
    PasswordHasherService,
    PasswordPolicyService,
    TokenCryptoService,
  ],
})
export class AuthModule {}
