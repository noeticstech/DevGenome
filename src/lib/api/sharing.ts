import type {
  DeveloperReportType,
  ProfileExportResponse,
  PublicProfileResponse,
  ReportExportResponse,
} from '@/lib/api/types'

import { apiRequest } from '@/lib/api/client'

export function getPublicProfileData(shareToken: string) {
  return apiRequest<PublicProfileResponse>(`/api/public/profile/${shareToken}`)
}

export function exportProfileData() {
  return apiRequest<ProfileExportResponse>('/api/export/profile')
}

export function exportReportData(reportType: DeveloperReportType) {
  return apiRequest<ReportExportResponse>(`/api/export/reports/${reportType}`)
}
