import type { AuthMeResponse, LogoutResponse } from '@/lib/api/types'

import { apiRequest, getBrowserApiUrl } from '@/lib/api/client'

export function getCurrentUser() {
  return apiRequest<AuthMeResponse>('/auth/me')
}

export function logoutCurrentUser() {
  return apiRequest<LogoutResponse>('/auth/logout', {
    method: 'POST',
  })
}

export function getGithubAuthStartUrl() {
  return getBrowserApiUrl('/auth/github')
}

export function getGithubAuthCallbackUrl(search: string) {
  const query = search.startsWith('?') ? search : `?${search}`
  return getBrowserApiUrl(`/auth/github/callback${query}`)
}
