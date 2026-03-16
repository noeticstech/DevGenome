import type { RequestHandler } from 'express'

import { getSessionCookieName, verifySessionToken, clearSessionCookie } from '../services/auth/session.service'
import { AppError } from '../utils/app-error'
import { getCookie } from '../utils/cookie'

export const requireAuthenticatedSession: RequestHandler = (req, res, next) => {
  const sessionToken = getCookie(req, getSessionCookieName())

  if (!sessionToken) {
    throw new AppError(401, 'Authentication required', {
      category: 'auth',
      code: 'AUTH_SESSION_REQUIRED',
    })
  }

  const session = verifySessionToken(sessionToken)

  if (!session) {
    clearSessionCookie(res)
    throw new AppError(401, 'Authentication required', {
      category: 'auth',
      code: 'AUTH_SESSION_INVALID',
    })
  }

  res.locals.session = session
  next()
}
