import type { SessionPayload } from '../../types/auth'
import { AppError } from '../../utils/app-error'
import { requireAuthenticatedGitHubAccountContext } from '../auth/auth.service'
import { GithubClient } from './githubClient'
import { normalizeGithubRepositoryLanguageSummary } from './githubNormalizer'
import type {
  GithubRepositoryLanguagesResponse,
  GithubRepositoryReference,
  NormalizedGithubRepositoryLanguageSummary,
} from './githubTypes'

interface GithubLanguageServiceOptions {
  fetchImpl?: typeof fetch
}

function assertRepositoryReference(repository: GithubRepositoryReference) {
  if (!repository.ownerLogin || !repository.name || !repository.fullName) {
    throw new AppError(400, 'A valid GitHub repository reference is required')
  }
}

export async function getNormalizedGithubRepositoryLanguages(
  accessToken: string,
  repository: GithubRepositoryReference,
  options: GithubLanguageServiceOptions = {},
): Promise<NormalizedGithubRepositoryLanguageSummary> {
  assertRepositoryReference(repository)

  const client = new GithubClient({
    accessToken,
    fetchImpl: options.fetchImpl,
  })

  const languageBytes = await client.getJson<GithubRepositoryLanguagesResponse>(
    `/repos/${encodeURIComponent(repository.ownerLogin)}/${encodeURIComponent(repository.name)}/languages`,
  )

  return normalizeGithubRepositoryLanguageSummary(repository, languageBytes)
}

export async function getNormalizedGithubRepositoryLanguagesForSession(
  session: SessionPayload | null,
  repository: GithubRepositoryReference,
  options: GithubLanguageServiceOptions = {},
): Promise<NormalizedGithubRepositoryLanguageSummary> {
  const account = await requireAuthenticatedGitHubAccountContext(session)
  return getNormalizedGithubRepositoryLanguages(account.accessToken, repository, options)
}
