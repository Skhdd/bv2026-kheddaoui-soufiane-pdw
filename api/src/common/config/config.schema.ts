import { z } from 'zod';

export const configSchema = z.object({
  APP_PORT: z.string().transform((val) => parseInt(val, 10)),
});

export type EnvironmentVariables = z.infer<typeof configSchema>;
