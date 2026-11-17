import { z } from "zod";

const requiredString = (name: string) =>
  z
    .string({
      error: () => `Missing required environment variable: ${name}`,
    })
    .min(1, `Environment variable cannot be empty: ${name}`);

export const envSchema = z.object({
  N8N_WEBHOOK_URL: requiredString("N8N_WEBHOOK_URL"),
  SUPABASE_URL: requiredString("SUPABASE_URL"),
  SUPABASE_ANON_KEY: requiredString("SUPABASE_ANON_KEY"),
  SUPABASE_SERVICE_ROLE_KEY: requiredString("SUPABASE_SERVICE_ROLE_KEY"),
  ADMIN_USERNAME: requiredString("ADMIN_USERNAME"),
  ADMIN_PASSWORD_HASH: requiredString("ADMIN_PASSWORD_HASH"),
  SESSION_SECRET: requiredString("SESSION_SECRET"),
  MOCK_CRM_MODE: requiredString("MOCK_CRM_MODE"),
  MOCK_CRM_TOKEN: requiredString("MOCK_CRM_TOKEN"),
});

export type Env = z.infer<typeof envSchema>;
export type EnvKey = keyof Env;

export function getEnv<K extends EnvKey>(
  keys: readonly K[],
  rawEnv: NodeJS.ProcessEnv = process.env
): Pick<Env, K> {
  const shape = {} as Record<K, z.ZodString>;
  for (const key of keys) {
    shape[key] = envSchema.shape[key];
  }

  const subsetSchema = z.object(shape);
  const result = subsetSchema.safeParse(rawEnv);

  if (!result.success) {
    const missingVars = result.error.issues.map((issue) =>
      issue.path.join(".")
    );
    throw new Error(
      `Missing or invalid environment variables: ${missingVars.join(", ")}`
    );
  }

  return result.data as Pick<Env, K>;
}
