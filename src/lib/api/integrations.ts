import type {
  CodeforcesLinkResponse,
  GithubAnalyzeResponse,
  GithubSyncResponse,
  LeetcodeLinkResponse,
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

export function linkLeetcodeAccount(username: string) {
  return apiRequest<LeetcodeLinkResponse>('/integrations/leetcode/link', {
    method: 'POST',
    body: JSON.stringify({ username }),
  })
}

export function triggerLeetcodeSync() {
  return apiRequest<GithubSyncResponse>('/integrations/leetcode/sync', {
    method: 'POST',
  })
}

export function linkCodeforcesAccount(handle: string) {
  return apiRequest<CodeforcesLinkResponse>('/integrations/codeforces/link', {
    method: 'POST',
    body: JSON.stringify({ handle }),
  })
}

export function triggerCodeforcesSync() {
  return apiRequest<GithubSyncResponse>('/integrations/codeforces/sync', {
    method: 'POST',
  })
}
