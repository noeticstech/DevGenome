import { AppError } from '../../utils/app-error'
import { LeetcodeClient } from './leetcodeClient'
import { normalizeLeetcodeProfile } from './leetcodeNormalizer'
import type {
  LeetcodeUserSnapshotResponse,
  NormalizedLeetcodeProfile,
} from './leetcodeTypes'

const GET_LEETCODE_USER_SNAPSHOT_QUERY = `
  query getLeetcodeUserSnapshot($username: String!) {
    matchedUser(username: $username) {
      username
      profile {
        realName
        userAvatar
        ranking
        reputation
        aboutMe
        school
        countryName
        company
        jobTitle
        skillTags
      }
      submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
          submissions
        }
      }
      badges {
        id
        displayName
        icon
      }
      languageProblemCount {
        languageName
        problemsSolved
      }
      tagProblemCounts {
        advanced {
          tagName
          problemsSolved
        }
        intermediate {
          tagName
          problemsSolved
        }
        fundamental {
          tagName
          problemsSolved
        }
      }
      userCalendar {
        activeYears
        streak
        totalActiveDays
      }
    }
    userContestRanking(username: $username) {
      rating
      globalRanking
      attendedContestsCount
      topPercentage
      totalParticipants
    }
  }
`

export async function fetchLeetcodeUserSnapshot(
  username: string,
): Promise<LeetcodeUserSnapshotResponse> {
  const client = new LeetcodeClient()
  const snapshot = await client.query<LeetcodeUserSnapshotResponse>({
    operationName: 'getLeetcodeUserSnapshot',
    query: GET_LEETCODE_USER_SNAPSHOT_QUERY,
    variables: {
      username,
    },
  })

  if (!snapshot.matchedUser) {
    throw new AppError(404, 'LeetCode profile not found')
  }

  return snapshot
}

export async function getNormalizedLeetcodeProfile(
  username: string,
): Promise<NormalizedLeetcodeProfile> {
  const snapshot = await fetchLeetcodeUserSnapshot(username)
  return normalizeLeetcodeProfile(snapshot)
}
