import { Router } from 'express'

import { getJobStatus, listRecentJobs } from '../controllers/jobs.controller'
import { requireAuthenticatedSession } from '../middleware/require-authenticated-session'

const jobsRouter = Router()

jobsRouter.use(requireAuthenticatedSession)
jobsRouter.get('/jobs', listRecentJobs)
jobsRouter.get('/jobs/:jobId', getJobStatus)

export { jobsRouter }
