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
  // Sanity (fase 4). Zonder project-ID toont de site de vaste teksten uit de code.
  SANITY_PROJECT_ID: z
    .string()
    .regex(/^[a-z0-9]+$/, "Alleen kleine letters en cijfers.")
    .optional(),
  SANITY_DATASET: z
    .string()
    .regex(/^[a-z0-9_-]+$/, "Alleen kleine letters, cijfers, - en _.")
    .default("production"),
  // Geheim waarmee Sanity de webhook naar /api/revalidate ondertekent.
  SANITY_WEBHOOK_SECRET: z.string().min(16).optional(),
  // Mail via Resend. Zonder deze twee waarden logt de site de mails alleen.
  RESEND_API_KEY: z
    .string()
    .trim()
    .regex(
      /^re_[A-Za-z0-9_]+$/,
      "Begint met re_, gevolgd door letters, cijfers of _.",
    )
    .optional(),
  MAIL_FROM: z
    .string()
    .trim()
    .refine(
      isAfzender,
      "Vul een e-mailadres in, of een naam met adres: Naam <adres@domein.nl>.",
    )
    .optional(),
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
    SANITY_PROJECT_ID: emptyToUndefined(source.SANITY_PROJECT_ID),
    SANITY_DATASET: emptyToUndefined(source.SANITY_DATASET),
    SANITY_WEBHOOK_SECRET: emptyToUndefined(source.SANITY_WEBHOOK_SECRET),
    RESEND_API_KEY: emptyToUndefined(source.RESEND_API_KEY),
    MAIL_FROM: emptyToUndefined(source.MAIL_FROM),
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

/** Een afzender: `adres@domein.tld` of `Naam <adres@domein.tld>`. */
function isAfzender(waarde: string): boolean {
  const metNaam = /^([^<>]*[^\s<>])\s*<([^<>]+)>$/.exec(waarde);
  if (metNaam && /\p{Cc}/u.test(metNaam[1] ?? "")) return false;
  const adres = metNaam ? metNaam[2] : waarde;
  return z.email().safeParse(adres).success;
}

/** Validated environment, parsed once at startup. */
export const env: Env = parseEnv(process.env);
