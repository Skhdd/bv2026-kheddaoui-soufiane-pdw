import { configSchema, EnvironmentVariables } from './config.schema.js';

export function validate(config: Record<string, unknown>): EnvironmentVariables {
  const result = configSchema.safeParse(config);

  if (!result.success) {
    console.error("erreur dans les variables :", result.error.format());
    throw new Error('config d environnement invalide');
  }

  return result.data;
}
