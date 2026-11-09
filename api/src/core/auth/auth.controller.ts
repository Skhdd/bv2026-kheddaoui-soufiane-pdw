import {
  Body,
  Controller,
  ForbiddenException,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import type { Request, Response } from 'express';

import {
  AuthAccessGuard,
  type AuthenticatedRequest,
} from './auth-access.guard';
import { AuthCredentialsService } from './auth-credentials.service';
import { AuthRefreshTokenService } from './auth-refresh-token.service';
import { AuthSessionService } from './auth-session.service';
import {
  AuthCookieService,
  CsrfTokenService,
  OpaqueTokenService,
  TokenCryptoService,
} from './security';

class RegisterAuthDto {
  @IsEmail()
  @MaxLength(320)
  email!: string;

  @IsString()
  @MinLength(15)
  @MaxLength(128)
  password!: string;
}

class LoginAuthDto {
  @IsEmail()
  @MaxLength(320)
  email!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(128)
  password!: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly credentials: AuthCredentialsService,
    private readonly refreshTokens: AuthRefreshTokenService,
    private readonly sessions: AuthSessionService,
    private readonly tokens: TokenCryptoService,
    private readonly cookies: AuthCookieService,
    private readonly csrfTokens: CsrfTokenService,
    private readonly opaqueTokens: OpaqueTokenService,
  ) {}

  // on recupere un cookie
  private readCookie(request: Request, name: string): string | undefined {
    const cookies: unknown = request.cookies;

    if (typeof cookies !== 'object' || cookies === null) {
      return undefined;
    }

    const value = (cookies as Record<string, unknown>)[name];

    return typeof value === 'string' ? value : undefined;
  }

  // inscription
  @Post('register')
  register(@Body() body: RegisterAuthDto): Promise<{ accountId: string }> {
    return this.credentials.register(body.email, body.password);
  }

  // connexion
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: LoginAuthDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ accessToken: string }> {
    const result = await this.credentials.login(body.email, body.password);

    this.cookies.setRefreshToken(response, result.refreshToken);
    this.cookies.setCsrfToken(response, result.csrfToken);

    return { accessToken: result.accessToken };
  }

  // renouvellement du token
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() request: Request,
    @Headers('x-csrf-token') csrfHeader: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ accessToken: string }> {
    const refreshToken = this.readCookie(request, 'refresh_token');

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token manquant');
    }

    const csrfCookie = this.readCookie(request, 'csrf_token');

    const rotated = await this.refreshTokens.rotate(
      refreshToken,
      csrfCookie,
      csrfHeader,
    );

    const accessToken = this.tokens.signAccessToken({
      accountId: rotated.accountId,
      sessionId: rotated.sessionId,
      accessVersion: rotated.accessVersion,
    });

    this.cookies.setRefreshToken(response, rotated.token);

    return { accessToken };
  }

  // deconnexion
  @Post('logout')
  @UseGuards(AuthAccessGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() request: AuthenticatedRequest,
    @Headers('x-csrf-token') csrfHeader: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const auth = request.auth;

    if (!auth) {
      throw new UnauthorizedException('Session invalide');
    }

    const csrfCookie = this.readCookie(request, 'csrf_token');

    this.csrfTokens.assertValid(auth.sessionId, csrfCookie, csrfHeader);

    const session = await this.sessions.findActiveById(auth.sessionId);

    if (
      !session ||
      !csrfCookie ||
      this.opaqueTokens.hash(csrfCookie) !== session.csrfTokenHash
    ) {
      throw new ForbiddenException('Token CSRF invalide');
    }

    await this.sessions.revoke(auth.sessionId);

    this.cookies.clearRefreshToken(response);
    this.cookies.clearCsrfToken(response);
  }
}
