import { SetMetadata } from '@nestjs/common';

import { ApiCodeResponse } from '../data';

export const API_SUCCESS_CODE_KEY = 'apiSuccessCode';

export const ApiSuccessCode = (
  code: ApiCodeResponse,
): MethodDecorator & ClassDecorator => SetMetadata(API_SUCCESS_CODE_KEY, code);
