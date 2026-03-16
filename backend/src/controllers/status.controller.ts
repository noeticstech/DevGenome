import type { RequestHandler } from 'express'

import { asyncHandler } from '../utils/async-handler'
import { getApiStatus } from '../services/status.service'

export const getStatus: RequestHandler = asyncHandler(async (_req, res) => {
  res.status(200).json(await getApiStatus())
})
