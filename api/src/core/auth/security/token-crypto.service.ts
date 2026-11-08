import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createPrivateKey, createPublicKey, type KeyObject } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { sign, verify } from 'jsonwebtoken';

import { EnvService } from '@common/config';

export type AccessTokenClaims = {
  accountId: string;
  sessionId: string;
  accessVersion: number;
};

@Injectable()
export class TokenCryptoService {
  private readonly privateKey: KeyObject;
  private readonly publicKey: KeyObject;

  constructor(private readonly env: EnvService) {
    this.privateKey = createPrivateKey(
      readFileSync(resolve(this.env.jwtPrivateKeyPath)),
    );

    this.publicKey = createPublicKey(
      readFileSync(resolve(this.env.jwtPublicKeyPath)),
    );
  }

  // on signe le token avec la clé privé
  signAccessToken(claims: AccessTokenClaims): string {
    return sign(
      {
        sid: claims.sessionId,
        ver: claims.accessVersion,
      },
      this.privateKey,
      {
        algorithm: 'ES256',
        subject: claims.accountId,
        issuer: this.env.jwtIssuer,
        audience: this.env.jwtAudience,
        expiresIn: '15m',
      },
    );
  }

  // on verifie la signature et l'expiration
  verifyAccessToken(token: string): AccessTokenClaims {
    let decoded: unknown;

    try {
      decoded = verify(token, this.publicKey, {
        algorithms: ['ES256'],
        issuer: this.env.jwtIssuer,
        audience: this.env.jwtAudience,
        maxAge: '15m',
      });
    } catch {
      throw new UnauthorizedException('Jeton invalide');
    }

    if (typeof decoded !== 'object' || decoded === null) {
      throw new UnauthorizedException('Jeton invalide');
    }

    const payload = decoded as Record<string, unknown>;

    if (
      typeof payload.sub !== 'string' ||
      typeof payload.sid !== 'string' ||
      typeof payload.ver !== 'number' ||
      !Number.isInteger(payload.ver) ||
      payload.ver < 1
    ) {
      throw new UnauthorizedException('Jeton invalide');
    }

    return {
      accountId: payload.sub,
      sessionId: payload.sid,
      accessVersion: payload.ver,
    };
  }
}
