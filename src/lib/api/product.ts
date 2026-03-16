import type {
  ActivityResponse,
  DashboardResponse,
  GenomeResponse,
  SkillsResponse,
  TimelineResponse,
} from '@/lib/api/types'

import { apiRequest } from '@/lib/api/client'

export function getDashboardData() {
  return apiRequest<DashboardResponse>('/api/dashboard')
}

export function getGenomeData() {
  return apiRequest<GenomeResponse>('/api/genome')
}

export function getActivityData() {
  return apiRequest<ActivityResponse>('/api/activity')
}

export function getSkillsData() {
  return apiRequest<SkillsResponse>('/api/skills')
}

export function getTimelineData() {
  return apiRequest<TimelineResponse>('/api/timeline')
}
