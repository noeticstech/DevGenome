import type { DeveloperReportType } from '../../types/api/reports'
import type { DeveloperReportModelOutput } from './reportTypes'

export const developerReportDeliveryStrategy = {
  source: 'on_demand' as const,
  persistsGeneratedContent: false,
  reason:
    'Reports are generated on demand so they stay aligned with the latest sync and deterministic analysis outputs without storing stale AI narrative.',
}

export async function loadPersistedDeveloperReport(
  userId: string,
  reportType: DeveloperReportType,
): Promise<DeveloperReportModelOutput | null> {
  void userId
  void reportType
  return null
}

export async function storeGeneratedDeveloperReport(input: {
  userId: string
  reportType: DeveloperReportType
  report: DeveloperReportModelOutput
}): Promise<void> {
  void input
  return
}
