type LogLevel = 'INFO' | 'WARN' | 'ERROR'

const REDACTED_KEYS = new Set([
  'authorization',
  'cookie',
  'set-cookie',
  'secret',
  'session',
  'sessiontoken',
  'session_token',
  'token',
  'access_token',
  'accesstoken',
  'refresh_token',
  'refreshtoken',
  'client_secret',
  'apikey',
  'api_key',
  'x-goog-api-key',
])

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function sanitizeLogValue(
  value: unknown,
  key?: string,
  seen = new WeakSet<object>(),
): unknown {
  if (key && REDACTED_KEYS.has(key.toLowerCase())) {
    return '[REDACTED]'
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
    }
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeLogValue(item, undefined, seen))
  }

  if (isPlainObject(value)) {
    if (seen.has(value)) {
      return '[Circular]'
    }

    seen.add(value)

    const sanitizedEntries = Object.entries(value).map(([entryKey, entryValue]) => [
      entryKey,
      sanitizeLogValue(entryValue, entryKey, seen),
    ])

    return Object.fromEntries(sanitizedEntries)
  }

  return value
}

function writeLog(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(meta ? { meta: sanitizeLogValue(meta) } : {}),
  }

  const serialized = JSON.stringify(entry)

  if (level === 'ERROR') {
    console.error(serialized)
    return
  }

  if (level === 'WARN') {
    console.warn(serialized)
    return
  }

  console.log(serialized)
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) =>
    writeLog('INFO', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) =>
    writeLog('WARN', message, meta),
  error: (message: string, meta?: Record<string, unknown>) =>
    writeLog('ERROR', message, meta),
}
