import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThan, Repository } from 'typeorm';

import { createUlid } from '@common/database';

import { AuthSessionEntity } from './data';
import { CsrfTokenService, OpaqueTokenService } from './security';

@Injectable()
export class AuthSessionService {
  constructor(
    @InjectRepository(AuthSessionEntity)
    private readonly sessions: Repository<AuthSessionEntity>,
    private readonly csrfTokens: CsrfTokenService,
    private readonly opaqueTokens: OpaqueTokenService,
  ) {}

  // on crée une session pour le compte
  async create(
    accountId: string,
    expiresAt: Date,
  ): Promise<{ session: AuthSessionEntity; csrfToken: string }> {
    if (Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date()) {
      throw new BadRequestException('Expiration de session invalide');
    }

    const sessionId = createUlid();
    const csrfToken = this.csrfTokens.generate(sessionId);

    const session = this.sessions.create({
      id: sessionId,
      accountId,
      accessVersion: 1,
      csrfTokenHash: this.opaqueTokens.hash(csrfToken),
      expiresAt,
      revokedAt: null,
    });

    const savedSession = await this.sessions.save(session);

    return {
      session: savedSession,
      csrfToken,
    };
  }

  // on cherche une session encore valide
  findActiveById(sessionId: string): Promise<AuthSessionEntity | null> {
    return this.sessions.findOne({
      where: {
        id: sessionId,
        revokedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
    });
  }

  // on ferme la session
  async revoke(sessionId: string): Promise<void> {
    await this.sessions.update(
      {
        id: sessionId,
        revokedAt: IsNull(),
      },
      {
        revokedAt: new Date(),
      },
    );
  }
}
