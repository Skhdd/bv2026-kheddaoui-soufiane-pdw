import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { DataSource, QueryFailedError } from 'typeorm';

import { AccountEntity, AccountStatus } from '@core/account/data';

import { AuthIdentifierService } from './auth-identifier.service';
import { AuthRefreshTokenService } from './auth-refresh-token.service';
import { AuthSessionService } from './auth-session.service';
import {
  AuthIdentifierEntity,
  AuthIdentifierType,
  PasswordCredentialEntity,
} from './data';
import { PasswordCredentialService } from './password-credential.service';
import {
  PasswordHasherService,
  PasswordPolicyService,
  TokenCryptoService,
} from './security';

@Injectable()
export class AuthCredentialsService {
  constructor(
    private readonly database: DataSource,
    private readonly identifiers: AuthIdentifierService,
    private readonly credentials: PasswordCredentialService,
    private readonly sessions: AuthSessionService,
    private readonly refreshTokens: AuthRefreshTokenService,
    private readonly policy: PasswordPolicyService,
    private readonly hasher: PasswordHasherService,
    private readonly tokens: TokenCryptoService,
  ) {}

  // on crée le compte avec son email et mot de passe
  async register(
    email: string,
    password: string,
  ): Promise<{ accountId: string }> {
    const normalizedEmail = email.trim().toLowerCase();

    this.policy.assertValid(password);

    const existing = await this.identifiers.findByEmail(normalizedEmail);

    if (existing) {
      throw new ConflictException('Adresse email deja utilisee');
    }

    const passwordHash = await this.hasher.hash(password);

    try {
      return await this.database.transaction(async (manager) => {
        const account = manager.create(AccountEntity, {
          status: AccountStatus.Active,
          anonymizedAt: null,
        });

        await manager.save(account);

        // on associe l'email au compte
        const identifier = manager.create(AuthIdentifierEntity, {
          accountId: account.id,
          type: AuthIdentifierType.Email,
          value: normalizedEmail,
          verifiedAt: null,
          isPrimary: true,
        });

        await manager.save(identifier);

        // on garde seulement le hash du mot de passe
        const credential = manager.create(PasswordCredentialEntity, {
          accountId: account.id,
          passwordHash,
          hashVersion: 1,
          failedAttempts: 0,
          lockedUntil: null,
          disabledAt: null,
          lastUsedAt: null,
          changedAt: new Date(),
        });

        await manager.save(credential);

        return { accountId: account.id };
      });
    } catch (error: unknown) {
      const databaseError: unknown =
        error instanceof QueryFailedError ? error.driverError : null;

      if (
        typeof databaseError === 'object' &&
        databaseError !== null &&
        'code' in databaseError &&
        databaseError.code === '23505'
      ) {
        throw new ConflictException('Adresse email deja utilisee');
      }

      throw error;
    }
  }

  // on connecte le compte si le mot de passe est bon
  async login(
    email: string,
    password: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    csrfToken: string;
  }> {
    const identifier = await this.identifiers.findByEmail(email);

    if (!identifier) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const valid = await this.credentials.verify(identifier.accountId, password);

    if (!valid) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const account = await this.database.getRepository(AccountEntity).findOne({
      where: {
        id: identifier.accountId,
        status: AccountStatus.Active,
      },
    });

    if (!account) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    // durée provisoire de la session de 7 jours
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const { session, csrfToken } = await this.sessions.create(
      account.id,
      expiresAt,
    );

    try {
      const refreshToken = await this.refreshTokens.issueInitial(
        session.id,
        expiresAt,
      );

      const accessToken = this.tokens.signAccessToken({
        accountId: account.id,
        sessionId: session.id,
        accessVersion: session.accessVersion,
      });

      return { accessToken, refreshToken, csrfToken };
    } catch (error) {
      await this.sessions.revoke(session.id);
      throw error;
    }
  }
}
