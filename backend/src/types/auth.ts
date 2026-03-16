import type { AccountProvider } from '@prisma/client'

export interface SessionPayload {
  type: 'session'
  userId: string
  connectedAccountId: string
  provider: AccountProvider
  iat: number
  exp: number
}

export interface OAuthStatePayload {
  type: 'oauth_state'
  nonce: string
  iat: number
  exp: number
}

export interface GitHubTokenResponse {
  access_token: string
  scope: string
  token_type: string
  refresh_token?: string
  expires_in?: number
  refresh_token_expires_in?: number
}

export interface GitHubUserResponse {
  id: number
  login: string
  name: string | null
  avatar_url: string
  html_url: string
  bio: string | null
  email: string | null
}

export interface GitHubEmailResponse {
  email: string
  primary: boolean
  verified: boolean
  visibility: string | null
}

export interface GitHubIdentity {
  provider: AccountProvider
  providerUserId: string
  username: string
  displayName: string | null
  avatarUrl: string | null
  profileUrl: string | null
  bio: string | null
  email: string | null
}

export interface AuthenticatedUserResponse {
  id: string
  email: string | null
  displayName: string | null
  username: string | null
  avatarUrl: string | null
  bio: string | null
  createdAt: string
  updatedAt: string
  connectedAccounts: Array<{
    id: string
    provider: AccountProvider
    username: string
    profileUrl: string | null
    avatarUrl: string | null
    lastSyncedAt: string | null
  }>
}
