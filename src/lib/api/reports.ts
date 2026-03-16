import type { DeveloperReportResponse, DeveloperReportType } from '@/lib/api/types'

import { apiRequest } from '@/lib/api/client'

export function getDeveloperReportData(reportType: DeveloperReportType) {
  return apiRequest<DeveloperReportResponse>(`/api/reports/${reportType}`)
}
