import crypto from 'node:crypto'
import type { CookieOptions, Response } from 'express'

import type { AccountProvider } from '@prisma/client'

import { env } from '../../config/env'
import type { OAuthStatePayload, SessionPayload } from '../../types/auth'
import { createSignedToken, verifySignedToken } from '../../utils/signed-token'

const SESSION_COOKIE_NAME = getCookieNameWithPrefix('devgenome_session')
const OAUTH_STATE_COOKIE_NAME = getCookieNameWithPrefix('devgenome_oauth_state')
const SESSION_TTL_SECONDS = env.SESSION_TTL_HOURS * 60 * 60
const OAUTH_STATE_TTL_SECONDS = 10 * 60

function getCookieNameWithPrefix(baseName: string) {
  if (env.NODE_ENV === 'production' && !env.SESSION_COOKIE_DOMAIN) {
    return `__Host-${baseName}`
  }

  return baseName
}

function getCookieOptions(maxAgeMs: number): CookieOptions {
  return {
    httpOnly: true,
    sameSite: env.SESSION_COOKIE_SAME_SITE,
    secure:
      env.NODE_ENV === 'production' || env.SESSION_COOKIE_SAME_SITE === 'none',
    domain: env.SESSION_COOKIE_DOMAIN,
    path: '/',
    maxAge: maxAgeMs,
    priority: 'high',
  }
}

export function createOAuthState() {
  const now = Math.floor(Date.now() / 1000)
  const payload: OAuthStatePayload = {
    type: 'oauth_state',
    nonce: crypto.randomUUID(),
    iat: now,
    exp: now + OAUTH_STATE_TTL_SECONDS,
  }

  return createSignedToken(payload, env.SESSION_SECRET)
}

export function verifyOAuthState(value: string) {
  const payload = verifySignedToken<OAuthStatePayload>(value, env.SESSION_SECRET)

  if (payload?.type !== 'oauth_state') {
    return null
  }

  return payload
}

export function setOAuthStateCookie(res: Response, value: string) {
  res.cookie(
    OAUTH_STATE_COOKIE_NAME,
    value,
    getCookieOptions(OAUTH_STATE_TTL_SECONDS * 1000),
  )
}

export function clearOAuthStateCookie(res: Response) {
  res.clearCookie(OAUTH_STATE_COOKIE_NAME, getCookieOptions(0))
}

export function createSessionToken(input: {
  userId: string
  connectedAccountId: string
  provider: AccountProvider
}) {
  const now = Math.floor(Date.now() / 1000)
  const payload: SessionPayload = {
    type: 'session',
    userId: input.userId,
    connectedAccountId: input.connectedAccountId,
    provider: input.provider,
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  }

  return createSignedToken(payload, env.SESSION_SECRET)
}

export function verifySessionToken(value: string) {
  const payload = verifySignedToken<SessionPayload>(value, env.SESSION_SECRET)

  if (payload?.type !== 'session') {
    return null
  }

  return payload
}

export function setSessionCookie(res: Response, token: string) {
  res.cookie(
    SESSION_COOKIE_NAME,
    token,
    getCookieOptions(SESSION_TTL_SECONDS * 1000),
  )
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(SESSION_COOKIE_NAME, getCookieOptions(0))
}

export function setSessionClearedResponseHeaders(res: Response) {
  res.setHeader('Clear-Site-Data', '"cookies", "storage"')
  res.setHeader('Cache-Control', 'no-store')
}

export function getSessionCookieName() {
  return SESSION_COOKIE_NAME
}

export function getOAuthStateCookieName() {
  return OAUTH_STATE_COOKIE_NAME
}
