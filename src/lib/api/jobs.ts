import type { BackgroundJobStatusResponse } from '@/lib/api/types'

import { apiRequest } from '@/lib/api/client'

export function getJobStatus(jobId: string) {
  return apiRequest<BackgroundJobStatusResponse>(`/api/jobs/${jobId}`)
}
