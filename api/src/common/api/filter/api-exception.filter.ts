import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';

import { ApiCodeResponse, ApiException, ApiResponse } from '../data';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
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

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      ApiResponse.error({
        code: ApiCodeResponse.CommonError,
      }),
    );
  }
}
