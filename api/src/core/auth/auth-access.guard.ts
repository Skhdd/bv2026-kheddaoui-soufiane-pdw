import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

import { AuthSessionService } from './auth-session.service';
import { TokenCryptoService } from './security';
import type { AccessTokenClaims } from './security/token-crypto.service';

export type AuthenticatedRequest = Request & {
  auth?: AccessTokenClaims;
};

@Injectable()
export class AuthAccessGuard implements CanActivate {
  constructor(
    private readonly tokens: TokenCryptoService,
    private readonly sessions: AuthSessionService,
  ) {}

  // on verifie le token envoyé dans la requete
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const authorization = request.headers.authorization;
    const token = authorization?.match(/^Bearer ([^\s]+)$/)?.[1];

    if (!token) {
      throw new UnauthorizedException('Jeton manquant');
    }

    const claims = this.tokens.verifyAccessToken(token);

    // on verifie si la session est encore valide
    const session = await this.sessions.findActiveById(claims.sessionId);

    if (
      !session ||
      session.accountId !== claims.accountId ||
      session.accessVersion !== claims.accessVersion
    ) {
      throw new UnauthorizedException('Session invalide');
    }

    request.auth = claims;

    return true;
  }
}
