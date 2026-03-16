import { env } from '../../config/env'

type CacheEntry = {
  value: unknown
  expiresAt: number
}

const cacheEntries = new Map<string, CacheEntry>()
const inflightEntries = new Map<string, Promise<unknown>>()
const userKeyIndex = new Map<string, Set<string>>()

function removeKey(key: string) {
  cacheEntries.delete(key)
  inflightEntries.delete(key)

  for (const [userId, keys] of userKeyIndex.entries()) {
    keys.delete(key)

    if (keys.size === 0) {
      userKeyIndex.delete(userId)
    }
  }
}

function registerKeyForUser(userId: string | undefined, key: string) {
  if (!userId) {
    return
  }

  const keys = userKeyIndex.get(userId) ?? new Set<string>()
  keys.add(key)
  userKeyIndex.set(userId, keys)
}

function clearExpiredEntry(key: string, now = Date.now()) {
  const entry = cacheEntries.get(key)

  if (!entry) {
    return
  }

  if (entry.expiresAt <= now) {
    removeKey(key)
  }
}

function normalizeKeyPart(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined) {
    return 'none'
  }

  return String(value).replace(/[^\w.-]+/g, '_')
}

export function createUserScopedCacheKey(input: {
  scope: string
  userId: string
  parts?: Array<string | number | boolean | null | undefined>
}) {
  const parts = input.parts?.map(normalizeKeyPart) ?? []
  return [input.scope, input.userId, ...parts].join(':')
}

export function buildCacheTimestamp(date: Date | null | undefined) {
  return date?.toISOString() ?? 'none'
}

export async function getOrSetRuntimeCacheValue<T>(input: {
  key: string
  ttlMs: number
  userId?: string
  enabled?: boolean
  loader: () => Promise<T>
}): Promise<T> {
  const cacheEnabled = input.enabled ?? env.CACHE_ENABLED

  if (!cacheEnabled) {
    return input.loader()
  }

  const now = Date.now()
  clearExpiredEntry(input.key, now)

  const existingEntry = cacheEntries.get(input.key)

  if (existingEntry) {
    return existingEntry.value as T
  }

  const inflightEntry = inflightEntries.get(input.key)

  if (inflightEntry) {
    return inflightEntry as Promise<T>
  }

  const promise = input.loader()
    .then((value) => {
      cacheEntries.set(input.key, {
        value,
        expiresAt: Date.now() + input.ttlMs,
      })
      registerKeyForUser(input.userId, input.key)
      inflightEntries.delete(input.key)
      return value
    })
    .catch((error) => {
      inflightEntries.delete(input.key)
      throw error
    })

  inflightEntries.set(input.key, promise as Promise<unknown>)

  return promise
}

export function invalidateUserRuntimeCache(userId: string) {
  const keys = userKeyIndex.get(userId)

  if (!keys) {
    return
  }

  for (const key of keys) {
    removeKey(key)
  }

  userKeyIndex.delete(userId)
}
