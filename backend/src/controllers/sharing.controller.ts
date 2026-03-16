import type { AuthenticatedResponseLocals } from '../types/http'
import type {
  ProfileExportResponse,
  PublicProfileResponse,
  ReportExportResponse,
} from '../types/api/sharing'
import type { DeveloperReportType } from '../types/api/reports'
import { asyncHandler } from '../utils/async-handler'
import { validateDeveloperReportType } from '../validators/reportValidator'
import { validatePublicProfileShareToken } from '../validators/sharingValidator'
import {
  getProfileExportResponse,
  getPublicProfileResponse,
  getReportExportResponse,
} from '../services/sharing'

type PublicProfileParams = {
  shareToken: string
}

type ReportExportParams = {
  reportType: DeveloperReportType
}

export const getPublicProfile = asyncHandler<
  PublicProfileParams,
  PublicProfileResponse
>(async (req, res) => {
  const shareToken = validatePublicProfileShareToken(req.params.shareToken)
  const response = await getPublicProfileResponse(shareToken)
  res.status(200).json(response)
})

export const exportProfile = asyncHandler<
  Record<string, never>,
  ProfileExportResponse,
  unknown,
  Record<string, never>,
  AuthenticatedResponseLocals
>(async (_req, res) => {
  const response = await getProfileExportResponse(res.locals.session.userId)
  res.status(200).json(response)
})

export const exportReport = asyncHandler<
  ReportExportParams,
  ReportExportResponse,
  unknown,
  Record<string, never>,
  AuthenticatedResponseLocals
>(async (req, res) => {
  const reportType = validateDeveloperReportType(req.params.reportType)
  const response = await getReportExportResponse({
    userId: res.locals.session.userId,
    reportType,
  })

  res.status(200).json(response)
})
