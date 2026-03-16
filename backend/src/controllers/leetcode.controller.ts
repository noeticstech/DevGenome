import type { Response } from 'express'
import type { ParamsDictionary } from 'express-serve-static-core'
import type { ParsedQs } from 'qs'
import { BackgroundJobTrigger } from '@prisma/client'

import { enqueueLeetcodeSyncJob } from '../jobs/jobQueueService'
import { linkLeetcodeAccountForUser } from '../services/leetcode/leetcodeLinkService'
import type { LeetcodeLinkResult } from '../services/leetcode/leetcodeTypes'
import type { BackgroundJobEnqueueResponse } from '../types/api/jobs'
import type { AuthenticatedResponseLocals } from '../types/http'
import { asyncHandler } from '../utils/async-handler'
import { validateLeetcodeLinkInput } from '../validators/leetcodeValidator'

export const linkLeetcodeAccount = asyncHandler<
  ParamsDictionary,
  LeetcodeLinkResult,
  unknown,
  ParsedQs,
  AuthenticatedResponseLocals
>(async (req, res: Response<LeetcodeLinkResult, AuthenticatedResponseLocals>) => {
  const input = validateLeetcodeLinkInput(req.body)
  const result = await linkLeetcodeAccountForUser({
    userId: res.locals.session.userId,
    username: input.username,
  })

  res.status(200).json(result)
})

export const triggerLeetcodeSync = asyncHandler<
  ParamsDictionary,
  BackgroundJobEnqueueResponse,
  unknown,
  ParsedQs,
  AuthenticatedResponseLocals
>(async (_req, res: Response<BackgroundJobEnqueueResponse, AuthenticatedResponseLocals>) => {
  const result = await enqueueLeetcodeSyncJob({
    userId: res.locals.session.userId,
    trigger: BackgroundJobTrigger.MANUAL,
  })
  res.status(result.created ? 202 : 200).json(result.response)
})
