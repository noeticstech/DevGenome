import { Router } from 'express'

import {
  getCurrentUser,
  handleGitHubCallback,
  logout,
  startGitHubAuth,
} from '../controllers/auth.controller'

const authRouter = Router()

authRouter.get('/github', startGitHubAuth)
authRouter.get('/github/callback', handleGitHubCallback)
authRouter.get('/me', getCurrentUser)
authRouter.post('/logout', logout)

export { authRouter }
