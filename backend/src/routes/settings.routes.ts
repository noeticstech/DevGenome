import { Router } from 'express'

import {
  deleteSettingsHistory,
  disconnectGithub,
  getSettings,
  patchSettingsPreferences,
} from '../controllers/settings.controller'
import { requireAuthenticatedSession } from '../middleware/require-authenticated-session'

const settingsRouter = Router()

settingsRouter.use(requireAuthenticatedSession)
settingsRouter.get('/settings', getSettings)
settingsRouter.patch('/settings/preferences', patchSettingsPreferences)
settingsRouter.post('/settings/disconnect/github', disconnectGithub)
settingsRouter.delete('/settings/history', deleteSettingsHistory)

export { settingsRouter }
