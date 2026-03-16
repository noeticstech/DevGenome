import type { AuthenticatedResponseLocals } from '../types/http'
import type {
  BackgroundJobListResponse,
  BackgroundJobStatusResponse,
} from '../types/api/jobs'
import {
  getBackgroundJobStatusForUser,
  listRecentBackgroundJobsForUser,
} from '../jobs/jobQueueService'
import { asyncHandler } from '../utils/async-handler'

export const listRecentJobs = asyncHandler<
  Record<string, never>,
  BackgroundJobListResponse,
  unknown,
  Record<string, never>,
  AuthenticatedResponseLocals
>(async (_req, res) => {
  const response = await listRecentBackgroundJobsForUser(res.locals.session.userId)

  res.status(200).json(response)
})

export const getJobStatus = asyncHandler<
  { jobId: string },
  BackgroundJobStatusResponse,
  unknown,
  Record<string, never>,
  AuthenticatedResponseLocals
>(async (req, res) => {
  const response = await getBackgroundJobStatusForUser(
    res.locals.session.userId,
    req.params.jobId,
  )

  res.status(200).json(response)
})
