import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import type { Response } from 'express';

import { AuthCredentialsService } from './auth-credentials.service';
import { AuthCookieService } from './security';

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
    private readonly cookies: AuthCookieService,
  ) {}

  // on inscrit un nouveau compte
  @Post('register')
  register(@Body() body: RegisterAuthDto): Promise<{ accountId: string }> {
    return this.credentials.register(body.email, body.password);
  }

  // on connecte le compte et on place les cookies
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
}
