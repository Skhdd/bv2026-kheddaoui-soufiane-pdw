import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isEmail } from 'class-validator';
import { Repository } from 'typeorm';

import { AuthIdentifierEntity, AuthIdentifierType } from './data';

@Injectable()
export class AuthIdentifierService {
  constructor(
    @InjectRepository(AuthIdentifierEntity)
    private readonly identifiers: Repository<AuthIdentifierEntity>,
  ) {}

  // on nettoie l'adresse email
  private normalizeEmail(email: string): string {
    const value = email.trim().toLowerCase();

    if (!isEmail(value) || value.length > 320) {
      throw new BadRequestException('Adresse email invalide');
    }

    return value;
  }

  // on cherche le compte avec son email
  async findByEmail(email: string): Promise<AuthIdentifierEntity | null> {
    return this.identifiers.findOne({
      where: {
        type: AuthIdentifierType.Email,
        value: this.normalizeEmail(email),
      },
    });
  }

  // on ajoute un email au compte
  async addEmail(
    accountId: string,
    email: string,
  ): Promise<AuthIdentifierEntity> {
    const value = this.normalizeEmail(email);

    const existing = await this.identifiers.findOne({
      where: {
        type: AuthIdentifierType.Email,
        value,
      },
    });

    if (existing) {
      throw new ConflictException('Adresse email deja utilisee');
    }

    const identifier = this.identifiers.create({
      accountId,
      type: AuthIdentifierType.Email,
      value,
      verifiedAt: null,
      isPrimary: true,
    });

    return this.identifiers.save(identifier);
  }
}
