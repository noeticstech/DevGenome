import dotenv from 'dotenv'
import path from 'node:path'
import { z } from 'zod'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const booleanFromEnv = z
  .enum(['true', 'false'])
  .transform((value) => value === 'true')

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  API_PREFIX: z.string().min(1).default('/api'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  GITHUB_CLIENT_ID: z.string().min(1, 'GITHUB_CLIENT_ID is required'),
  GITHUB_CLIENT_SECRET: z.string().min(1, 'GITHUB_CLIENT_SECRET is required'),
  GITHUB_CALLBACK_URL: z.string().url('GITHUB_CALLBACK_URL must be a valid URL'),
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters'),
  SESSION_TTL_HOURS: z.coerce.number().int().positive().default(168),
  GEMINI_API_KEY: z.string().min(1).optional(),
  GEMINI_MODEL: z.string().min(1).default('gemini-2.5-flash'),
  GEMINI_API_BASE_URL: z
    .string()
    .url('GEMINI_API_BASE_URL must be a valid URL')
    .default('https://generativelanguage.googleapis.com/v1beta'),
  GEMINI_TIMEOUT_MS: z.coerce.number().int().positive().default(15_000),
  CACHE_ENABLED: booleanFromEnv.default('true'),
  PRODUCT_RESPONSE_CACHE_TTL_MS: z.coerce.number().int().positive().default(30_000),
  ANALYSIS_SNAPSHOT_CACHE_TTL_MS: z.coerce.number().int().positive().default(30_000),
  AI_RESPONSE_CACHE_TTL_MS: z.coerce.number().int().positive().default(900_000),
  JOB_WORKER_ENABLED: booleanFromEnv.default('true'),
  JOB_SCHEDULER_ENABLED: booleanFromEnv.default('true'),
  JOB_POLL_INTERVAL_MS: z.coerce.number().int().positive().default(3_000),
  JOB_CONCURRENCY: z.coerce.number().int().positive().default(1),
  JOB_RETRY_BASE_DELAY_MS: z.coerce.number().int().positive().default(60_000),
  JOB_SCHEDULER_INTERVAL_MS: z.coerce.number().int().positive().default(300_000),
  GITHUB_SYNC_INTERVAL_MINUTES: z.coerce.number().int().positive().default(720),
  LEETCODE_SYNC_INTERVAL_MINUTES: z.coerce.number().int().positive().default(1_440),
  CODEFORCES_SYNC_INTERVAL_MINUTES: z.coerce.number().int().positive().default(1_440),
})

const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
  const formattedErrors = parsedEnv.error.flatten().fieldErrors
  throw new Error(`Invalid environment configuration: ${JSON.stringify(formattedErrors)}`)
}

export const env = parsedEnv.data

export function isGeminiConfigured() {
  return Boolean(env.GEMINI_API_KEY)
}
