import type { RequestHandler } from 'express'

import { asyncHandler } from '../utils/async-handler'
import { getHealthStatus } from '../services/health.service'

export const getHealth: RequestHandler = asyncHandler(async (_req, res) => {
  res.status(200).json(await getHealthStatus())
})
