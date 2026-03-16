import type { SessionPayload } from '../../types/auth'
import { AppError } from '../../utils/app-error'
import { requireAuthenticatedGitHubAccountContext } from '../auth/auth.service'
import { GithubClient } from './githubClient'
import { normalizeGithubProfile } from './githubNormalizer'
import type { GithubProfileResponse, NormalizedGithubProfile } from './githubTypes'

interface GithubProfileServiceOptions {
  fetchImpl?: typeof fetch
}

export async function getNormalizedGithubProfile(
  accessToken: string,
  options: GithubProfileServiceOptions = {},
): Promise<NormalizedGithubProfile> {
  const client = new GithubClient({
    accessToken,
    fetchImpl: options.fetchImpl,
  })

  const profile = await client.getJson<GithubProfileResponse>('/user')
  return normalizeGithubProfile(profile)
}

export async function getNormalizedGithubProfileForSession(
  session: SessionPayload | null,
  options: GithubProfileServiceOptions = {},
): Promise<NormalizedGithubProfile> {
  const account = await requireAuthenticatedGitHubAccountContext(session)
  const profile = await getNormalizedGithubProfile(account.accessToken, options)

  if (profile.providerUserId !== account.providerUserId) {
    throw new AppError(409, 'GitHub account identity mismatch')
  }

  return profile
}
