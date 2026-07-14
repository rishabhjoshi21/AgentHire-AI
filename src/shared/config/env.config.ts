import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),

  PORT: z.coerce.number().positive(),

  DATABASE_URL: z.string().url(),

  REDIS_HOST: z.string().min(1),

  REDIS_PORT: z.coerce.number().positive(),
});

export type Env = z.infer<typeof envSchema>;
