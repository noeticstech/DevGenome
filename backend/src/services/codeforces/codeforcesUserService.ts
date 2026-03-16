import { CodeforcesClient } from './codeforcesClient'
import { normalizeCodeforcesIdentity } from './codeforcesNormalizer'
import type {
  CodeforcesUserResponse,
  NormalizedCodeforcesIdentity,
} from './codeforcesTypes'

export async function fetchCodeforcesUserInfo(
  handle: string,
): Promise<CodeforcesUserResponse> {
  const client = new CodeforcesClient()
  const users = await client.getJson<CodeforcesUserResponse[]>('user.info', {
    handles: handle,
  })

  return users[0]
}

export async function getNormalizedCodeforcesIdentity(
  handle: string,
): Promise<NormalizedCodeforcesIdentity> {
  const user = await fetchCodeforcesUserInfo(handle)
  return normalizeCodeforcesIdentity(user)
}
