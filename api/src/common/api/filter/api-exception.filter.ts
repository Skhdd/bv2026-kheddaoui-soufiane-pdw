import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

import { ApiCodeResponse, ApiException, ApiResponse } from '../data';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof ApiException) {
      response.status(exception.getStatus()).json(exception.getResponse());
      return;
    }

    if (exception instanceof HttpException) {
      response.status(exception.getStatus()).json(
        ApiResponse.error({
          code: ApiCodeResponse.CommonError,
        }),
      );
      return;
    }

    if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
    } else {
      this.logger.error('Erreur serveur inattendue');
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      ApiResponse.error({
        code: ApiCodeResponse.CommonError,
      }),
    );
  }
}
