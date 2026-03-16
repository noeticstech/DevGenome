import type {
  DeleteAccountResponse,
  DeleteSettingsHistoryResponse,
  DisconnectGithubResponse,
  SettingsResponse,
  UpdateSettingsPreferencesPayload,
  UpdateSettingsPreferencesResponse,
} from '@/lib/api/types'

import { apiRequest } from '@/lib/api/client'

export function getSettingsData() {
  return apiRequest<SettingsResponse>('/api/settings')
}

export function updateSettingsPreferences(
  payload: UpdateSettingsPreferencesPayload,
) {
  return apiRequest<UpdateSettingsPreferencesResponse>('/api/settings/preferences', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function disconnectGithubAccount() {
  return apiRequest<DisconnectGithubResponse>('/api/settings/disconnect/github', {
    method: 'POST',
  })
}

export function deleteSettingsHistory() {
  return apiRequest<DeleteSettingsHistoryResponse>('/api/settings/history', {
    method: 'DELETE',
  })
}

export function deleteCurrentAccount() {
  return apiRequest<DeleteAccountResponse>('/api/account', {
    method: 'DELETE',
  })
}
