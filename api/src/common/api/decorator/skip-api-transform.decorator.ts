import { SetMetadata } from '@nestjs/common';

export const SKIP_API_TRANSFORM_KEY = 'skipApiTransform';

export const SkipApiTransform = (): MethodDecorator & ClassDecorator =>
  SetMetadata(SKIP_API_TRANSFORM_KEY, true);
