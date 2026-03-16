import type { BackgroundJobStatusResponse } from '@/lib/api/types'

import { getJobStatus } from '@/lib/api/jobs'

const DEFAULT_POLL_INTERVAL_MS = 1500
const DEFAULT_TIMEOUT_MS = 120000

function delay(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

export async function waitForBackgroundJobCompletion(input: {
  jobId: string
  pollIntervalMs?: number
  timeoutMs?: number
  onStatus?: (status: BackgroundJobStatusResponse['job']['status']) => void
}) {
  const pollIntervalMs = input.pollIntervalMs ?? DEFAULT_POLL_INTERVAL_MS
  const timeoutMs = input.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const startedAt = Date.now()

  while (Date.now() - startedAt <= timeoutMs) {
    const response = await getJobStatus(input.jobId)
    input.onStatus?.(response.job.status)

    if (response.job.status === 'SUCCEEDED') {
      return {
        outcome: 'succeeded' as const,
        response,
      }
    }

    if (response.job.status === 'FAILED') {
      return {
        outcome: 'failed' as const,
        response,
      }
    }

    await delay(pollIntervalMs)
  }

  return {
    outcome: 'timed_out' as const,
    response: null,
  }
}
