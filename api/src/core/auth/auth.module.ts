import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthAccessGuard } from './auth-access.guard';
import { AuthController } from './auth.controller';
import { AuthCredentialsService } from './auth-credentials.service';
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
  controllers: [AuthController],
  providers: [
    AuthAccessGuard,
    AuthCredentialsService,
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
    AuthAccessGuard,
    AuthCredentialsService,
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
