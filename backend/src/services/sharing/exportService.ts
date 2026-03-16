import type {
  ProfileExportResponse,
  ReportExportResponse,
} from '../../types/api/sharing'
import type { DeveloperReportType } from '../../types/api/reports'
import { getActivityResponse } from '../product/activityService'
import { getDashboardResponse } from '../product/dashboardService'
import { getGenomeResponse } from '../product/genomeService'
import { getSkillsResponse } from '../product/skillsService'
import { getTimelineResponse } from '../product/timelineService'
import { getDeveloperReportResponse } from '../reports'

const EXPORT_SCHEMA_VERSION = '2026-03-16' as const

export async function getProfileExportResponse(
  userId: string,
): Promise<ProfileExportResponse> {
  const [dashboard, genome, activity, skills, timeline] = await Promise.all([
    getDashboardResponse(userId),
    getGenomeResponse(userId),
    getActivityResponse(userId),
    getSkillsResponse(userId),
    getTimelineResponse(userId),
  ])

  return {
    export: {
      kind: 'profile',
      format: 'json',
      exportedAt: new Date().toISOString(),
      schemaVersion: EXPORT_SCHEMA_VERSION,
    },
    data: {
      dashboard,
      genome,
      activity,
      skills,
      timeline,
    },
  }
}

export async function getReportExportResponse(input: {
  userId: string
  reportType: DeveloperReportType
}): Promise<ReportExportResponse> {
  const report = await getDeveloperReportResponse(input.userId, input.reportType)

  return {
    export: {
      kind: 'report',
      format: 'json',
      exportedAt: new Date().toISOString(),
      schemaVersion: EXPORT_SCHEMA_VERSION,
      reportType: input.reportType,
    },
    data: report,
  }
}
