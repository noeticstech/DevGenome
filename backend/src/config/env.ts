import dotenv from 'dotenv'
import path from 'node:path'
import { z } from 'zod'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const booleanFromEnv = z
  .enum(['true', 'false'])
  .transform((value) => value === 'true')

const sameSiteFromEnv = z.enum(['lax', 'strict', 'none'])

function isHttpsUrl(value: string) {
  return new URL(value).protocol === 'https:'
}

function normalizeOriginList(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  API_PREFIX: z.string().min(1).default('/api'),
  APP_ORIGIN: z.string().url('APP_ORIGIN must be a valid URL').default('http://localhost:5173'),
  TRUSTED_APP_ORIGINS: z.string().default('http://localhost:5173'),
  TRUST_PROXY: booleanFromEnv.default('false'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  GITHUB_CLIENT_ID: z.string().min(1, 'GITHUB_CLIENT_ID is required'),
  GITHUB_CLIENT_SECRET: z.string().min(1, 'GITHUB_CLIENT_SECRET is required'),
  GITHUB_CALLBACK_URL: z.string().url('GITHUB_CALLBACK_URL must be a valid URL'),
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters'),
  TOKEN_ENCRYPTION_SECRET: z
    .string()
    .min(32, 'TOKEN_ENCRYPTION_SECRET must be at least 32 characters')
    .optional(),
  SESSION_TTL_HOURS: z.coerce.number().int().positive().default(168),
  SESSION_COOKIE_SAME_SITE: sameSiteFromEnv.default('lax'),
  SESSION_COOKIE_DOMAIN: z.string().min(1).optional(),
  REQUEST_BODY_LIMIT_KB: z.coerce.number().int().positive().max(1024).default(256),
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

const trustedAppOrigins = normalizeOriginList(parsedEnv.data.TRUSTED_APP_ORIGINS).map(
  (origin) => new URL(origin).origin,
)

if (!trustedAppOrigins.includes(new URL(parsedEnv.data.APP_ORIGIN).origin)) {
  trustedAppOrigins.push(new URL(parsedEnv.data.APP_ORIGIN).origin)
}

if (parsedEnv.data.NODE_ENV === 'production') {
  if (!isHttpsUrl(parsedEnv.data.APP_ORIGIN)) {
    throw new Error('APP_ORIGIN must use HTTPS in production')
  }

  if (!trustedAppOrigins.every(isHttpsUrl)) {
    throw new Error('TRUSTED_APP_ORIGINS must use HTTPS in production')
  }

  if (!isHttpsUrl(parsedEnv.data.GITHUB_CALLBACK_URL)) {
    throw new Error('GITHUB_CALLBACK_URL must use HTTPS in production')
  }

  if (!parsedEnv.data.TOKEN_ENCRYPTION_SECRET) {
    throw new Error('TOKEN_ENCRYPTION_SECRET is required in production')
  }

  if (parsedEnv.data.TOKEN_ENCRYPTION_SECRET === parsedEnv.data.SESSION_SECRET) {
    throw new Error('TOKEN_ENCRYPTION_SECRET must differ from SESSION_SECRET in production')
  }
}

if (parsedEnv.data.SESSION_COOKIE_SAME_SITE === 'none' && !parsedEnv.data.TRUST_PROXY && parsedEnv.data.NODE_ENV === 'production') {
  throw new Error('TRUST_PROXY should be enabled in production when using SameSite=None cookies behind a proxy')
}

export const env = {
  ...parsedEnv.data,
  TRUSTED_APP_ORIGINS: trustedAppOrigins,
}

export function isGeminiConfigured() {
  return Boolean(env.GEMINI_API_KEY)
}

export function getTokenEncryptionSecret() {
  return env.TOKEN_ENCRYPTION_SECRET ?? env.SESSION_SECRET
}
