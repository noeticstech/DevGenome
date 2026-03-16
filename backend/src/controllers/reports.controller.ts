import type { AuthenticatedResponseLocals } from '../types/http'
import type { DeveloperReportResponse, DeveloperReportType } from '../types/api/reports'
import { getDeveloperReportResponse } from '../services/reports'
import { asyncHandler } from '../utils/async-handler'
import { validateDeveloperReportType } from '../validators/reportValidator'

type ReportParams = {
  reportType: DeveloperReportType
}

export const getDeveloperReport = asyncHandler<
  ReportParams,
  DeveloperReportResponse,
  unknown,
  Record<string, never>,
  AuthenticatedResponseLocals
>(async (req, res) => {
  const reportType = validateDeveloperReportType(req.params.reportType)
  const response = await getDeveloperReportResponse(
    res.locals.session.userId,
    reportType,
  )

  res.status(200).json(response)
})
