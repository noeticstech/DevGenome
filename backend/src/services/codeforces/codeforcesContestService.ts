import { CodeforcesClient } from './codeforcesClient'
import { normalizeCodeforcesSyncPayload } from './codeforcesNormalizer'
import { fetchCodeforcesUserInfo } from './codeforcesUserService'
import type {
  CodeforcesContestResponse,
  CodeforcesSubmissionResponse,
  NormalizedCodeforcesSyncPayload,
} from './codeforcesTypes'

export async function fetchCodeforcesContestHistory(
  handle: string,
): Promise<CodeforcesContestResponse[]> {
  const client = new CodeforcesClient()
  return client.getJson<CodeforcesContestResponse[]>('user.rating', {
    handle,
  })
}

export async function fetchCodeforcesSubmissionHistory(input: {
  handle: string
  pageSize?: number
  maxPages?: number
}): Promise<{
  submissions: CodeforcesSubmissionResponse[]
  isPartial: boolean
}> {
  const client = new CodeforcesClient()
  const result = await client.getPaginatedSubmissions(input.handle, {
    pageSize: input.pageSize,
    maxPages: input.maxPages,
  })

  return {
    submissions: result.items,
    isPartial: result.isPartial,
  }
}

export async function getNormalizedCodeforcesSyncPayload(
  handle: string,
): Promise<NormalizedCodeforcesSyncPayload> {
  const [user, contests, submissionHistory] = await Promise.all([
    fetchCodeforcesUserInfo(handle),
    fetchCodeforcesContestHistory(handle),
    fetchCodeforcesSubmissionHistory({
      handle,
    }),
  ])

  return normalizeCodeforcesSyncPayload({
    user,
    contests,
    submissions: submissionHistory.submissions,
    submissionsArePartial: submissionHistory.isPartial,
  })
}
