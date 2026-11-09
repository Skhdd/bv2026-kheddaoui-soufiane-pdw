import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthIdentifierService } from './auth-identifier.service';
import { AuthRefreshTokenService } from './auth-refresh-token.service';
import { AuthSessionService } from './auth-session.service';
import {
  AuthIdentifierEntity,
  AuthRefreshTokenEntity,
  AuthSessionEntity,
  PasswordCredentialEntity,
} from './data';
import { PasswordCredentialService } from './password-credential.service';
import {
  AuthCookieService,
  CsrfTokenService,
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
    AuthIdentifierService,
    AuthRefreshTokenService,
    AuthSessionService,
    AuthCookieService,
    CsrfTokenService,
    OpaqueTokenService,
    PasswordCredentialService,
    PasswordHasherService,
    PasswordPolicyService,
    TokenCryptoService,
  ],
  exports: [
    AuthIdentifierService,
    AuthRefreshTokenService,
    AuthSessionService,
    AuthCookieService,
    CsrfTokenService,
    OpaqueTokenService,
    PasswordCredentialService,
    PasswordHasherService,
    PasswordPolicyService,
    TokenCryptoService,
  ],
})
export class AuthModule {}
