import { Router } from 'express'

import { env } from '../config/env'
import { accountRouter } from './account.routes'
import { authRouter } from './auth.routes'
import { healthRouter } from './health.routes'
import { integrationsRouter } from './integrations.routes'
import { insightsRouter } from './insights.routes'
import { jobsRouter } from './jobs.routes'
import { productRouter } from './product.routes'
import { reportsRouter } from './reports.routes'
import { sharingRouter } from './sharing.routes'
import { settingsRouter } from './settings.routes'
import { statusRouter } from './status.routes'

const router = Router()

router.use('/health', healthRouter)
router.use('/auth', authRouter)
router.use('/integrations', integrationsRouter)
router.use(env.API_PREFIX, statusRouter)
router.use(env.API_PREFIX, productRouter)
router.use(env.API_PREFIX, insightsRouter)
router.use(env.API_PREFIX, reportsRouter)
router.use(env.API_PREFIX, sharingRouter)
router.use(env.API_PREFIX, jobsRouter)
router.use(env.API_PREFIX, settingsRouter)
router.use(env.API_PREFIX, accountRouter)

export { router }
