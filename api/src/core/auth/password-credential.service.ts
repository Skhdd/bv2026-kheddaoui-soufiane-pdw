import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PasswordCredentialEntity } from './data';
import { PasswordHasherService, PasswordPolicyService } from './security';

@Injectable()
export class PasswordCredentialService {
  private readonly maxAttempts = 5;
  private readonly lockDurationMs = 15 * 60 * 1000;

  constructor(
    @InjectRepository(PasswordCredentialEntity)
    private readonly credentials: Repository<PasswordCredentialEntity>,
    private readonly policy: PasswordPolicyService,
    private readonly hasher: PasswordHasherService,
  ) {}

  // on enregistre le mot de passe du compte
  async create(accountId: string, password: string): Promise<void> {
    this.policy.assertValid(password);

    const existing = await this.credentials.findOne({
      where: { accountId },
    });

    if (existing) {
      throw new ConflictException('Ce compte possede deja un mot de passe');
    }

    const passwordHash = await this.hasher.hash(password);

    const credential = this.credentials.create({
      accountId,
      passwordHash,
      hashVersion: 1,
      failedAttempts: 0,
      lockedUntil: null,
      disabledAt: null,
      lastUsedAt: null,
      changedAt: new Date(),
    });

    await this.credentials.save(credential);
  }

  // on verifie le mot de passe du compte
  async verify(accountId: string, password: string): Promise<boolean> {
    const credential = await this.credentials.findOne({
      where: { accountId },
    });

    if (!credential || credential.disabledAt !== null) {
      return false;
    }

    const now = new Date();

    // on bloque si y a trop de tentative raté
    if (credential.lockedUntil && credential.lockedUntil > now) {
      return false;
    }

    const wasLocked = credential.lockedUntil !== null;
    const valid = await this.hasher.verify(credential.passwordHash, password);

    if (!valid) {
      credential.failedAttempts = wasLocked ? 1 : credential.failedAttempts + 1;

      if (credential.failedAttempts >= this.maxAttempts) {
        credential.lockedUntil = new Date(now.getTime() + this.lockDurationMs);
      }

      await this.credentials.save(credential);

      return false;
    }

    // on remet les tentative a zero si c bon
    credential.failedAttempts = 0;
    credential.lockedUntil = null;
    credential.lastUsedAt = now;

    await this.credentials.save(credential);

    return true;
  }
}
