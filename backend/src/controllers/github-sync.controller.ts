import type { Response } from 'express'
import type { ParamsDictionary } from 'express-serve-static-core'
import type { ParsedQs } from 'qs'
import { BackgroundJobTrigger } from '@prisma/client'

import {
  enqueueGithubSyncJob,
  enqueueUserAnalysisJob,
} from '../jobs/jobQueueService'
import type { BackgroundJobEnqueueResponse } from '../types/api/jobs'
import type { AuthenticatedResponseLocals } from '../types/http'
import { asyncHandler } from '../utils/async-handler'

export const triggerGithubSync = asyncHandler<
  ParamsDictionary,
  BackgroundJobEnqueueResponse,
  unknown,
  ParsedQs,
  AuthenticatedResponseLocals
>(async (_req, res: Response<BackgroundJobEnqueueResponse, AuthenticatedResponseLocals>) => {
  const result = await enqueueGithubSyncJob({
    userId: res.locals.session.userId,
    trigger: BackgroundJobTrigger.MANUAL,
  })

  res.status(result.created ? 202 : 200).json(result.response)
})

export const triggerUserAnalysis = asyncHandler<
  ParamsDictionary,
  BackgroundJobEnqueueResponse,
  unknown,
  ParsedQs,
  AuthenticatedResponseLocals
>(async (_req, res: Response<BackgroundJobEnqueueResponse, AuthenticatedResponseLocals>) => {
  const result = await enqueueUserAnalysisJob({
    userId: res.locals.session.userId,
    trigger: BackgroundJobTrigger.MANUAL,
  })

  res.status(result.created ? 202 : 200).json(result.response)
})
