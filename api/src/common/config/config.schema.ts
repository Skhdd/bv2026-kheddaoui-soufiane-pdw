import { z } from 'zod';
//validation de mes variables d envrionnement avec zod pour .env et qui garanti des type correct pour l'app
export const configSchema = z.object({
  APP_PORT: z.string().transform((val) => parseInt(val, 10)),
});

export type EnvironmentVariables = z.infer<typeof configSchema>;
