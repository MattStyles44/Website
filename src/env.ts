import { z } from "zod";

/**
 * Schema for every environment variable the app reads.
 * Keep this in sync with `.env.example`.
 */
export const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  APP_NAME: z.string().trim().min(1).default("SignUp Reclame"),
  APP_URL: z.url().default("http://localhost:3000"),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validates a set of raw environment variables and returns a typed object.
 * Throws a readable error listing every invalid variable.
 */
export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse({
    NODE_ENV: source.NODE_ENV,
    APP_NAME: emptyToUndefined(source.APP_NAME),
    APP_URL: emptyToUndefined(source.APP_URL),
  });

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment variables:\n${issues}`);
  }

  return result.data;
}

function emptyToUndefined(value: string | undefined): string | undefined {
  return value === undefined || value.trim() === "" ? undefined : value;
}

/** Validated environment, parsed once at startup. */
export const env: Env = parseEnv(process.env);
