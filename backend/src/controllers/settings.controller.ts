import type { AuthenticatedResponseLocals } from '../types/http'
import type {
  DeleteSettingsHistoryResponse,
  DisconnectGithubResponse,
  SettingsResponse,
  UpdateSettingsPreferencesResponse,
} from '../types/api/settings'
import {
  clearSessionCookie,
  setSessionClearedResponseHeaders,
} from '../services/auth/session.service'
import { presentDeleteHistoryResult, presentDisconnectGithubResult } from '../presenters/settingsPresenter'
import { deleteUserHistory } from '../services/settings/historyDeletionService'
import { disconnectGithubForUser } from '../services/settings/githubDisconnectService'
import { updateSettingsPreferences } from '../services/settings/preferenceUpdateService'
import { getSettingsResponse } from '../services/settings/settingsService'
import { validateSettingsPreferenceUpdate } from '../validators/settingsValidator'
import { asyncHandler } from '../utils/async-handler'

export const getSettings = asyncHandler<
  Record<string, never>,
  SettingsResponse,
  unknown,
  Record<string, never>,
  AuthenticatedResponseLocals
>(async (_req, res) => {
  const response = await getSettingsResponse(res.locals.session.userId)
  res.status(200).json(response)
})

export const patchSettingsPreferences = asyncHandler<
  Record<string, never>,
  UpdateSettingsPreferencesResponse,
  unknown,
  Record<string, never>,
  AuthenticatedResponseLocals
>(async (req, res) => {
  const preferences = validateSettingsPreferenceUpdate(req.body)
  const settings = await updateSettingsPreferences({
    userId: res.locals.session.userId,
    preferences,
  })

  res.status(200).json({
    success: true,
    message: 'Settings updated successfully',
    settings,
  })
})

export const disconnectGithub = asyncHandler<
  Record<string, never>,
  DisconnectGithubResponse,
  unknown,
  Record<string, never>,
  AuthenticatedResponseLocals
>(async (_req, res) => {
  const result = await disconnectGithubForUser(res.locals.session.userId)
  clearSessionCookie(res)
  setSessionClearedResponseHeaders(res)
  res.status(200).json(presentDisconnectGithubResult(result))
})

export const deleteSettingsHistory = asyncHandler<
  Record<string, never>,
  DeleteSettingsHistoryResponse,
  unknown,
  Record<string, never>,
  AuthenticatedResponseLocals
>(async (_req, res) => {
  const result = await deleteUserHistory(res.locals.session.userId)
  res.status(200).json(presentDeleteHistoryResult(result))
})
