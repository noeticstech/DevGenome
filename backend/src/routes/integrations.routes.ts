import { Router } from 'express'

import {
  triggerGithubSync,
  triggerUserAnalysis,
} from '../controllers/github-sync.controller'
import {
  linkCodeforcesAccount,
  triggerCodeforcesSync,
} from '../controllers/codeforces.controller'
import {
  linkLeetcodeAccount,
  triggerLeetcodeSync,
} from '../controllers/leetcode.controller'
import { requireAuthenticatedSession } from '../middleware/require-authenticated-session'

const integrationsRouter = Router()

integrationsRouter.post('/github/sync', requireAuthenticatedSession, triggerGithubSync)
integrationsRouter.post('/github/analyze', requireAuthenticatedSession, triggerUserAnalysis)
integrationsRouter.post('/leetcode/link', requireAuthenticatedSession, linkLeetcodeAccount)
integrationsRouter.post('/leetcode/sync', requireAuthenticatedSession, triggerLeetcodeSync)
integrationsRouter.post('/codeforces/link', requireAuthenticatedSession, linkCodeforcesAccount)
integrationsRouter.post('/codeforces/sync', requireAuthenticatedSession, triggerCodeforcesSync)

export { integrationsRouter }
