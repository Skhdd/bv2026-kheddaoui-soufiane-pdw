import { ForbiddenException, Injectable } from '@nestjs/common';
import { randomBytes, timingSafeEqual } from 'node:crypto';

import { OpaqueTokenService } from './opaque-token.service';

@Injectable()
export class CsrfTokenService {
  constructor(private readonly opaqueTokens: OpaqueTokenService) {}

  // on genere un token lié a la session
  generate(sessionId: string): string {
    const random = randomBytes(32).toString('base64url');
    const signature = this.opaqueTokens.hash(`${sessionId}:${random}`);

    return `${random}.${signature}`;
  }

  // on verifie le token envoyé par le client
  assertValid(
    sessionId: string,
    cookieToken?: string,
    headerToken?: string,
  ): void {
    if (!sessionId || !cookieToken || !headerToken) {
      throw new ForbiddenException('Token CSRF manquant');
    }

    const cookie = Buffer.from(cookieToken);
    const header = Buffer.from(headerToken);

    if (cookie.length !== header.length || !timingSafeEqual(cookie, header)) {
      throw new ForbiddenException('Token CSRF invalide');
    }

    const [random, signature, extra] = cookieToken.split('.');

    if (
      extra !== undefined ||
      !random ||
      !signature ||
      !/^[A-Za-z0-9_-]{43}$/.test(random) ||
      !/^[a-f0-9]{64}$/.test(signature)
    ) {
      throw new ForbiddenException('Token CSRF invalide');
    }

    const expected = this.opaqueTokens.hash(`${sessionId}:${random}`);
    const signatureBytes = Buffer.from(signature, 'hex');
    const expectedBytes = Buffer.from(expected, 'hex');

    if (!timingSafeEqual(signatureBytes, expectedBytes)) {
      throw new ForbiddenException('Token CSRF invalide');
    }
  }
}
