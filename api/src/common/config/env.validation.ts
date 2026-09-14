import { configSchema, EnvironmentVariables } from './config.schema.js';
//une fonction de validation
export function validate(config: Record<string, unknown>): EnvironmentVariables {
  const result = configSchema.safeParse(config);
//si le env est invalide l'app se bloque et affiche l'erreur directement
  if (!result.success) {
    console.error("erreur dans les variables :", result.error.format());
    throw new Error('config d environnement invalide');
  }

  return result.data;
}
