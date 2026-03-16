import { Router } from 'express'

import { getInsights } from '../controllers/insights.controller'
import { requireAuthenticatedSession } from '../middleware/require-authenticated-session'

const insightsRouter = Router()

insightsRouter.use(requireAuthenticatedSession)
insightsRouter.get('/insights', getInsights)

export { insightsRouter }
