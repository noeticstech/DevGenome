import { Router } from 'express'

import { getDeveloperReport } from '../controllers/reports.controller'
import { requireAuthenticatedSession } from '../middleware/require-authenticated-session'

const reportsRouter = Router()

reportsRouter.use(requireAuthenticatedSession)
reportsRouter.get('/reports/:reportType', getDeveloperReport)

export { reportsRouter }
