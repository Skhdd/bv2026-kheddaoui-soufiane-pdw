import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApiCodeResponse, ApiResponse } from '../data';
import { API_SUCCESS_CODE_KEY, SKIP_API_TRANSFORM_KEY } from '../decorator';

@Injectable()
export class ApiResponseInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const skipTransform = this.reflector.getAllAndOverride<boolean>(
      SKIP_API_TRANSFORM_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (skipTransform) {
      return next.handle();
    }

    const code =
      this.reflector.getAllAndOverride<ApiCodeResponse>(API_SUCCESS_CODE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? ApiCodeResponse.CommonSuccess;

    return next
      .handle()
      .pipe(map((data: unknown) => ApiResponse.success(data, code)));
  }
}
