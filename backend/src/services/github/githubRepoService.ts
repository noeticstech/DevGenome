import type { SessionPayload } from '../../types/auth'
import { requireAuthenticatedGitHubAccountContext } from '../auth/auth.service'
import { GithubClient } from './githubClient'
import { normalizeGithubRepository } from './githubNormalizer'
import type { GithubRepositoryResponse, NormalizedGithubRepository } from './githubTypes'

export interface GithubRepositoryListOptions {
  visibility?: 'all' | 'public' | 'private'
  perPage?: number
  maxPages?: number
  fetchImpl?: typeof fetch
}

export async function listNormalizedGithubRepositories(
  accessToken: string,
  options: GithubRepositoryListOptions = {},
): Promise<NormalizedGithubRepository[]> {
  const client = new GithubClient({
    accessToken,
    fetchImpl: options.fetchImpl,
  })

  const repositories = await client.getPaginated<GithubRepositoryResponse>('/user/repos', {
    perPage: options.perPage,
    maxPages: options.maxPages,
    query: {
      visibility: options.visibility ?? 'all',
      affiliation: 'owner,collaborator,organization_member',
      sort: 'updated',
      direction: 'desc',
    },
  })

  return repositories.map(normalizeGithubRepository)
}

export async function listNormalizedGithubRepositoriesForSession(
  session: SessionPayload | null,
  options: GithubRepositoryListOptions = {},
): Promise<NormalizedGithubRepository[]> {
  const account = await requireAuthenticatedGitHubAccountContext(session)
  return listNormalizedGithubRepositories(account.accessToken, options)
}
