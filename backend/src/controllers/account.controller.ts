import type { AuthenticatedResponseLocals } from '../types/http'
import type { DeleteAccountResponse } from '../types/api/settings'
import { clearSessionCookie } from '../services/auth/session.service'
import { presentDeleteAccountResult } from '../presenters/settingsPresenter'
import { deleteUserAccount } from '../services/settings/accountDeletionService'
import { asyncHandler } from '../utils/async-handler'

export const deleteAccount = asyncHandler<
  Record<string, never>,
  DeleteAccountResponse,
  unknown,
  Record<string, never>,
  AuthenticatedResponseLocals
>(async (_req, res) => {
  await deleteUserAccount(res.locals.session.userId)
  clearSessionCookie(res)
  res.status(200).json(presentDeleteAccountResult())
})
