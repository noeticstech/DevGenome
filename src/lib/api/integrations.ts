import type {
  GithubAnalyzeResponse,
  GithubSyncResponse,
} from '@/lib/api/types'

import { apiRequest } from '@/lib/api/client'

export function triggerGithubSync() {
  return apiRequest<GithubSyncResponse>('/integrations/github/sync', {
    method: 'POST',
  })
}

export function triggerGithubAnalysis() {
  return apiRequest<GithubAnalyzeResponse>('/integrations/github/analyze', {
    method: 'POST',
  })
}
