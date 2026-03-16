import { AccountProvider } from '@prisma/client'

import { env } from '../../config/env'
import { AppError } from '../../utils/app-error'
import type {
  GitHubEmailResponse,
  GitHubIdentity,
  GitHubTokenResponse,
  GitHubUserResponse,
} from '../../types/auth'

const GITHUB_OAUTH_SCOPE = 'read:user user:email'

async function parseGitHubResponse<T>(response: Response, fallbackMessage: string) {
  if (!response.ok) {
    throw new AppError(502, fallbackMessage, {
      category: 'auth',
      code: 'GITHUB_OAUTH_RESPONSE_INVALID',
      retryable: response.status >= 500,
    })
  }

  return (await response.json()) as T
}

export function createGitHubAuthorizationUrl(state: string) {
  const url = new URL('https://github.com/login/oauth/authorize')

  url.searchParams.set('client_id', env.GITHUB_CLIENT_ID)
  url.searchParams.set('redirect_uri', env.GITHUB_CALLBACK_URL)
  url.searchParams.set('scope', GITHUB_OAUTH_SCOPE)
  url.searchParams.set('state', state)

  return url.toString()
}

export async function exchangeCodeForAccessToken(code: string) {
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: env.GITHUB_CALLBACK_URL,
    }),
  })

  const payload = await parseGitHubResponse<GitHubTokenResponse & { error?: string }>(
    response,
    'GitHub OAuth exchange failed',
  )

  if (!payload.access_token || payload.error) {
    throw new AppError(502, 'GitHub OAuth exchange failed', {
      category: 'auth',
      code: 'GITHUB_OAUTH_EXCHANGE_FAILED',
    })
  }

  return payload
}

async function fetchPrimaryEmail(accessToken: string) {
  const response = await fetch('https://api.github.com/user/emails', {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${accessToken}`,
      'User-Agent': 'DevGenome-Backend',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })

  const emails = await parseGitHubResponse<GitHubEmailResponse[]>(
    response,
    'Unable to fetch GitHub email',
  )

  const primaryVerifiedEmail =
    emails.find((email) => email.primary && email.verified)?.email ??
    emails.find((email) => email.verified)?.email ??
    emails[0]?.email ??
    null

  return primaryVerifiedEmail
}

export async function fetchGitHubIdentity(accessToken: string): Promise<GitHubIdentity> {
  const response = await fetch('https://api.github.com/user', {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${accessToken}`,
      'User-Agent': 'DevGenome-Backend',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })

  const user = await parseGitHubResponse<GitHubUserResponse>(
    response,
    'Unable to fetch GitHub identity',
  )

  const email = user.email ?? (await fetchPrimaryEmail(accessToken))

  return {
    provider: AccountProvider.GITHUB,
    providerUserId: String(user.id),
    username: user.login,
    displayName: user.name,
    avatarUrl: user.avatar_url,
    profileUrl: user.html_url,
    bio: user.bio,
    email,
  }
}
