import { Injectable } from '@nestjs/common';
import type { CookieOptions, Response } from 'express';

import { EnvService } from '@common/config';

@Injectable()
export class AuthCookieService {
  constructor(private readonly env: EnvService) {}

  private get options(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.env.isProduction,
      sameSite: 'lax',
      path: '/',
    };
  }

  // on garde le token dans un cookie protege
  setRefreshToken(response: Response, token: string): void {
    response.cookie('refresh_token', token, this.options);
  }

  // on supprime le cookie a la deconnexion
  clearRefreshToken(response: Response): void {
    response.clearCookie('refresh_token', this.options);
  }

  // cookie que le navigateur peut lire
  setCsrfToken(response: Response, token: string): void {
    response.cookie('csrf_token', token, {
      ...this.options,
      httpOnly: false,
    });
  }

  // on retire le token csrf
  clearCsrfToken(response: Response): void {
    response.clearCookie('csrf_token', {
      ...this.options,
      httpOnly: false,
    });
  }
}
