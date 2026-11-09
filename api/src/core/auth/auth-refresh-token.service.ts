import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createUlid } from '@common/database';
import { EntityManager, IsNull, MoreThan, Repository } from 'typeorm';

import { AuthSessionEntity } from './data/entity/auth-session.entity';
import { AuthRefreshTokenEntity } from './data/entity/auth-refresh-token.entity';
import { CsrfTokenService, OpaqueTokenService } from './security';

type RotationResult =
  | {
      status: 'ok';
      token: string;
      sessionId: string;
      accountId: string;
      accessVersion: number;
    }
  | { status: 'invalid' }
  | { status: 'reused' };

@Injectable()
export class AuthRefreshTokenService {
  constructor(
    @InjectRepository(AuthRefreshTokenEntity)
    private readonly refreshTokens: Repository<AuthRefreshTokenEntity>,
    private readonly opaqueTokens: OpaqueTokenService,
    private readonly csrfTokens: CsrfTokenService,
  ) {}

  // on bloque la session pendant les modifications
  private lockSession(
    manager: EntityManager,
    sessionId: string,
  ): Promise<AuthSessionEntity | null> {
    return manager
      .getRepository(AuthSessionEntity)
      .createQueryBuilder('session')
      .setLock('pessimistic_write')
      .where('session.id = :sessionId', { sessionId })
      .getOne();
  }

  // on verifie le csrf avant de modifier la session
  private assertCsrf(
    session: AuthSessionEntity,
    cookieToken?: string,
    headerToken?: string,
  ): void {
    this.csrfTokens.assertValid(session.id, cookieToken, headerToken);

    if (
      !cookieToken ||
      this.opaqueTokens.hash(cookieToken) !== session.csrfTokenHash
    ) {
      throw new ForbiddenException('Token CSRF invalide');
    }
  }

  // on crée le premier token de la session
  async issueInitial(sessionId: string, expiresAt: Date): Promise<string> {
    if (!(expiresAt instanceof Date) || Number.isNaN(expiresAt.getTime())) {
      throw new BadRequestException('Expiration du token invalide');
    }

    return this.refreshTokens.manager.transaction(async (manager) => {
      const session = await this.lockSession(manager, sessionId);
      const now = new Date();

      if (!session || session.revokedAt !== null || session.expiresAt <= now) {
        throw new UnauthorizedException('Session invalide');
      }

      if (expiresAt <= now || expiresAt > session.expiresAt) {
        throw new BadRequestException('Expiration du token invalide');
      }

      const repository = manager.getRepository(AuthRefreshTokenEntity);

      const existing = await repository.findOne({
        where: {
          sessionId,
          consumedAt: IsNull(),
          revokedAt: IsNull(),
          expiresAt: MoreThan(now),
        },
      });

      if (existing) {
        throw new ConflictException('Un token actif existe deja');
      }

      const token = this.opaqueTokens.generate();

      // on garde seulement son empreinte
      const refreshToken = repository.create({
        sessionId,
        tokenHash: this.opaqueTokens.hash(token),
        parentId: null,
        replacedById: null,
        expiresAt,
        consumedAt: null,
        revokedAt: null,
      });

      await repository.save(refreshToken);

      return token;
    });
  }

  // on remplace un token par un nouveau
  async rotate(
    token: string,
    csrfCookie?: string,
    csrfHeader?: string,
  ): Promise<{
    token: string;
    sessionId: string;
    accountId: string;
    accessVersion: number;
  }> {
    if (!/^[A-Za-z0-9_-]{43}$/.test(token)) {
      throw new UnauthorizedException('Refresh token invalide');
    }

    const tokenHash = this.opaqueTokens.hash(token);

    const original = await this.refreshTokens.findOne({
      where: { tokenHash },
    });

    if (!original) {
      throw new UnauthorizedException('Refresh token invalide');
    }

    const result = await this.refreshTokens.manager.transaction(
      async (manager): Promise<RotationResult> => {
        const session = await this.lockSession(manager, original.sessionId);
        const now = new Date();

        if (
          !session ||
          session.revokedAt !== null ||
          session.expiresAt <= now
        ) {
          return { status: 'invalid' };
        }

        // on verifie le csrf avant la rotation
        this.assertCsrf(session, csrfCookie, csrfHeader);

        const repository = manager.getRepository(AuthRefreshTokenEntity);

        const current = await repository.findOne({
          where: { id: original.id },
        });

        if (!current) {
          return { status: 'invalid' };
        }

        // si le token a deja servi on ferme la session
        if (current.consumedAt !== null) {
          await repository.update(
            { sessionId: session.id, revokedAt: IsNull() },
            { revokedAt: now },
          );

          const sessionRepository = manager.getRepository(AuthSessionEntity);

          await sessionRepository.update(
            { id: session.id, revokedAt: IsNull() },
            { revokedAt: now },
          );

          return { status: 'reused' };
        }

        if (current.revokedAt !== null || current.expiresAt <= now) {
          return { status: 'invalid' };
        }

        // on genere un nouveau token
        const newToken = this.opaqueTokens.generate();

        const replacement = repository.create({
          id: createUlid(),
          sessionId: session.id,
          tokenHash: this.opaqueTokens.hash(newToken),
          parentId: current.id,
          replacedById: null,
          expiresAt: current.expiresAt,
          consumedAt: null,
          revokedAt: null,
        });

        await repository.save(replacement);

        // l'ancien token ne peut plus servir
        await repository.update(
          { id: current.id, consumedAt: IsNull() },
          {
            consumedAt: now,
            replacedById: replacement.id,
          },
        );

        return {
          status: 'ok',
          token: newToken,
          sessionId: session.id,
          accountId: session.accountId,
          accessVersion: session.accessVersion,
        };
      },
    );

    if (result.status !== 'ok') {
      throw new UnauthorizedException('Refresh token invalide');
    }

    return {
      token: result.token,
      sessionId: result.sessionId,
      accountId: result.accountId,
      accessVersion: result.accessVersion,
    };
  }
}
