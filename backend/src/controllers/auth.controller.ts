import type { RequestHandler } from 'express'

import { createGitHubAuthorizationUrl } from '../services/github/github-oauth.service'
import {
  clearOAuthStateCookie,
  clearSessionCookie,
  createOAuthState,
  createSessionToken,
  getOAuthStateCookieName,
  getSessionCookieName,
  setSessionClearedResponseHeaders,
  setOAuthStateCookie,
  setSessionCookie,
  verifyOAuthState,
  verifySessionToken,
} from '../services/auth/session.service'
import { completeGitHubAuthentication, getAuthenticatedUser } from '../services/auth/auth.service'
import { getCookie } from '../utils/cookie'
import { AppError } from '../utils/app-error'
import { asyncHandler } from '../utils/async-handler'
import { env } from '../config/env'

export const startGitHubAuth: RequestHandler = (_req, res) => {
  const state = createOAuthState()
  const authorizationUrl = createGitHubAuthorizationUrl(state)

  setOAuthStateCookie(res, state)
  res.redirect(302, authorizationUrl)
}

export const handleGitHubCallback: RequestHandler = asyncHandler(async (req, res) => {
  const code = typeof req.query.code === 'string' ? req.query.code : null
  const state = typeof req.query.state === 'string' ? req.query.state : null
  const stateCookie = getCookie(req, getOAuthStateCookieName())

  if (!code) {
    throw new AppError(400, 'Missing GitHub OAuth code')
  }

  if (!state || !stateCookie || state !== stateCookie || !verifyOAuthState(state)) {
    throw new AppError(400, 'Invalid GitHub OAuth state')
  }

  const { session, user } = await completeGitHubAuthentication({ code })
  const signedSessionToken = createSessionToken({
    userId: session.userId,
    connectedAccountId: session.connectedAccountId,
    provider: session.provider,
  })

  clearOAuthStateCookie(res)
  setSessionCookie(res, signedSessionToken)

  const successUrl = new URL('/login', env.APP_ORIGIN)
  successUrl.searchParams.set('auth', 'success')
  successUrl.searchParams.set('provider', 'github')
  successUrl.searchParams.set('username', user.username ?? user.displayName ?? 'developer')

  res.redirect(302, successUrl.toString())
})

export const getCurrentUser: RequestHandler = asyncHandler(async (req, res) => {
  const sessionToken = getCookie(req, getSessionCookieName())
  const session = sessionToken ? verifySessionToken(sessionToken) : null
  const user = await getAuthenticatedUser(session)

  if (!user && sessionToken) {
    clearSessionCookie(res)
  }

  res.status(200).json({
    authenticated: Boolean(user),
    user,
  })
})

export const logout: RequestHandler = (_req, res) => {
  clearOAuthStateCookie(res)
  clearSessionCookie(res)
  setSessionClearedResponseHeaders(res)

  res.status(200).json({
    authenticated: false,
    message: 'Logged out successfully',
  })
}
