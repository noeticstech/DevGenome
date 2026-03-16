import type { AuthenticatedResponseLocals } from '../types/http'
import type {
  ActivityResponse,
  DashboardResponse,
  GenomeResponse,
  SkillsResponse,
  TimelineResponse,
} from '../types/api/product'
import { asyncHandler } from '../utils/async-handler'
import { getActivityResponse } from '../services/product/activityService'
import { getDashboardResponse } from '../services/product/dashboardService'
import { getGenomeResponse } from '../services/product/genomeService'
import { getSkillsResponse } from '../services/product/skillsService'
import { getTimelineResponse } from '../services/product/timelineService'

export const getDashboard = asyncHandler<
  Record<string, never>,
  DashboardResponse,
  unknown,
  Record<string, never>,
  AuthenticatedResponseLocals
>(async (_req, res) => {
  const response = await getDashboardResponse(res.locals.session.userId)
  res.status(200).json(response)
})

export const getGenome = asyncHandler<
  Record<string, never>,
  GenomeResponse,
  unknown,
  Record<string, never>,
  AuthenticatedResponseLocals
>(async (_req, res) => {
  const response = await getGenomeResponse(res.locals.session.userId)
  res.status(200).json(response)
})

export const getActivity = asyncHandler<
  Record<string, never>,
  ActivityResponse,
  unknown,
  Record<string, never>,
  AuthenticatedResponseLocals
>(async (_req, res) => {
  const response = await getActivityResponse(res.locals.session.userId)
  res.status(200).json(response)
})

export const getSkills = asyncHandler<
  Record<string, never>,
  SkillsResponse,
  unknown,
  Record<string, never>,
  AuthenticatedResponseLocals
>(async (_req, res) => {
  const response = await getSkillsResponse(res.locals.session.userId)
  res.status(200).json(response)
})

export const getTimeline = asyncHandler<
  Record<string, never>,
  TimelineResponse,
  unknown,
  Record<string, never>,
  AuthenticatedResponseLocals
>(async (_req, res) => {
  const response = await getTimelineResponse(res.locals.session.userId)
  res.status(200).json(response)
})
