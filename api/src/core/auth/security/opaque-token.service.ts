import { Injectable } from '@nestjs/common';
import { createHmac, randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { EnvService } from '@common/config';

@Injectable()
export class OpaqueTokenService {
  private readonly secret: Buffer;

  constructor(private readonly env: EnvService) {
    this.secret = readFileSync(resolve(this.env.opaqueTokenHmacKeyPath));

    if (this.secret.length < 32) {
      throw new Error('La cle HMAC doit contenir au moins 32 octets');
    }
  }

  // on genere un token aleatoire
  generate(): string {
    return randomBytes(32).toString('base64url');
  }

  // on garde seulement son empreinte
  hash(token: string): string {
    return createHmac('sha256', this.secret)
      .update(token, 'utf8')
      .digest('hex');
  }
}
