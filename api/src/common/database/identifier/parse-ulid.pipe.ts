import { HttpStatus, Injectable, PipeTransform } from '@nestjs/common';

import { ApiCodeResponse, ApiException } from '@common/api';

import { ULID_REGEX } from './ulid.util';

@Injectable()
export class ParseUlidPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    // on verifie juste si l'id a le bon format
    if (!ULID_REGEX.test(value)) {
      throw new ApiException({
        statusCode: HttpStatus.BAD_REQUEST,
        code: ApiCodeResponse.CommonInvalidIdentifier,
        logMessage: 'invalid identifier',
      });
    }

    return value;
  }
}
