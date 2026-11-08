import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordCredentialService } from './password-credential.service';
import { AuthIdentifierService } from './auth-identifier.service';
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
    PasswordCredentialService,
    AuthIdentifierService,
  ],
  exports: [
    OpaqueTokenService,
    PasswordHasherService,
    PasswordPolicyService,
    TokenCryptoService,
    PasswordCredentialService,
    AuthIdentifierService,
  ],
})
export class AuthModule {}
