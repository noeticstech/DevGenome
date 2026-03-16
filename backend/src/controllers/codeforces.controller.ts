import type { Response } from 'express'
import type { ParamsDictionary } from 'express-serve-static-core'
import type { ParsedQs } from 'qs'
import { BackgroundJobTrigger } from '@prisma/client'

import { enqueueCodeforcesSyncJob } from '../jobs/jobQueueService'
import { linkCodeforcesAccountForUser } from '../services/codeforces/codeforcesLinkService'
import type { CodeforcesLinkResult } from '../services/codeforces/codeforcesTypes'
import type { BackgroundJobEnqueueResponse } from '../types/api/jobs'
import type { AuthenticatedResponseLocals } from '../types/http'
import { asyncHandler } from '../utils/async-handler'
import { validateCodeforcesLinkInput } from '../validators/codeforcesValidator'

export const linkCodeforcesAccount = asyncHandler<
  ParamsDictionary,
  CodeforcesLinkResult,
  unknown,
  ParsedQs,
  AuthenticatedResponseLocals
>(async (req, res: Response<CodeforcesLinkResult, AuthenticatedResponseLocals>) => {
  const input = validateCodeforcesLinkInput(req.body)
  const result = await linkCodeforcesAccountForUser({
    userId: res.locals.session.userId,
    handle: input.handle,
  })

  res.status(200).json(result)
})

export const triggerCodeforcesSync = asyncHandler<
  ParamsDictionary,
  BackgroundJobEnqueueResponse,
  unknown,
  ParsedQs,
  AuthenticatedResponseLocals
>(async (_req, res: Response<BackgroundJobEnqueueResponse, AuthenticatedResponseLocals>) => {
  const result = await enqueueCodeforcesSyncJob({
    userId: res.locals.session.userId,
    trigger: BackgroundJobTrigger.MANUAL,
  })
  res.status(result.created ? 202 : 200).json(result.response)
})
