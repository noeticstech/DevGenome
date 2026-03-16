import { normalizeLeetcodeSyncPayload } from './leetcodeNormalizer'
import { fetchLeetcodeUserSnapshot } from './leetcodeUserService'
import type { NormalizedLeetcodeSyncPayload } from './leetcodeTypes'

export async function getNormalizedLeetcodeStats(
  username: string,
): Promise<NormalizedLeetcodeSyncPayload> {
  const snapshot = await fetchLeetcodeUserSnapshot(username)
  return normalizeLeetcodeSyncPayload(snapshot)
}
