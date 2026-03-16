import type { SessionPayload } from './auth'

export interface BaseResponseLocals extends Record<string, unknown> {
  requestId?: string
}

export interface AuthenticatedResponseLocals extends BaseResponseLocals {
  session: SessionPayload
}
