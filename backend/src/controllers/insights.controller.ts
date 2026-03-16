import type { AuthenticatedResponseLocals } from '../types/http'
import type { AiInsightsResponse } from '../types/api/insights'
import { getGeminiInsightsResponse } from '../services/ai'
import { asyncHandler } from '../utils/async-handler'

export const getInsights = asyncHandler<
  Record<string, never>,
  AiInsightsResponse,
  unknown,
  Record<string, never>,
  AuthenticatedResponseLocals
>(async (_req, res) => {
  const response = await getGeminiInsightsResponse(res.locals.session.userId)
  res.status(200).json(response)
})
