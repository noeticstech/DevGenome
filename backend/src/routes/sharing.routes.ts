import { Router } from 'express'

import {
  exportProfile,
  exportReport,
  getPublicProfile,
} from '../controllers/sharing.controller'
import { requireAuthenticatedSession } from '../middleware/require-authenticated-session'

const sharingRouter = Router()

sharingRouter.get('/public/profile/:shareToken', getPublicProfile)

sharingRouter.use(requireAuthenticatedSession)
sharingRouter.get('/export/profile', exportProfile)
sharingRouter.get('/export/reports/:reportType', exportReport)

export { sharingRouter }
