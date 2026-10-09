import { z } from 'zod';
import { AppMode, LogLevel } from '../data/enum';

const appModeSchema = z
  .enum(['DEV', 'TEST', 'PROD', 'development', 'test', 'production'])
  .transform((value) => {
    if (value === 'development') {
      return AppMode.Dev;
    }

    if (value === 'test') {
      return AppMode.Test;
    }

    if (value === 'production') {
      return AppMode.Prod;
    }

    return value as AppMode;
  });

const environmentSchema = z.object({
  NODE_ENV: appModeSchema,

  APP_NAME: z.string().min(1).default('api'),

  APP_PORT: z.coerce.number().int().min(1).max(65535).default(3000),

  APP_BASE_URL: z.string().default('api'),

  APP_CORS_ORIGIN: z.string().default('http://localhost:4200'),

  APP_TRUST_PROXY: z
    .string()
    .default('false')
    .transform((value) => value === 'true'),

  APP_HTTP_PAYLOAD_ERROR_CODE: z.coerce.number().int().default(422),

  LOG_LEVEL: z.nativeEnum(LogLevel).default(LogLevel.Debug),

SWAGGER_ENABLED: z
  .string()
  .default('true')
  .transform((value) => value === 'true'),

SWAGGER_TITLE: z.string().min(1).default('API'),

SWAGGER_DESCRIPTION: z.string().min(1).default('HTTP API'),

SWAGGER_VERSION: z.string().min(1).default('0.1.0'),

SWAGGER_PATH: z.string().min(1).default('docs'),
  
});

export type ValidatedEnvironment = z.infer<typeof environmentSchema>;

export const validateEnvironment = (
  config: Record<string, unknown>,
): ValidatedEnvironment => {
  const result = environmentSchema.safeParse(config);

  if (!result.success) {
    const message = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');

    throw new Error(`Invalid environment configuration: ${message}`);
  }

  return result.data;
};
