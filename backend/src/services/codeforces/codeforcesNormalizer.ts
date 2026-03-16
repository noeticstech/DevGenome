import type {
  CodeforcesContestResponse,
  CodeforcesSubmissionResponse,
  CodeforcesUserResponse,
  NormalizedCodeforcesContestResult,
  NormalizedCodeforcesIdentity,
  NormalizedCodeforcesProfile,
  NormalizedCodeforcesSyncPayload,
  NormalizedCodeforcesTagStat,
} from './codeforcesTypes'

const RECENT_WINDOW_DAYS = 180
const RECENT_CONTEST_WINDOW_DAYS = 365

type CodeforcesSubmissionSummary = {
  totalSolvedProblems: number
  acceptedSubmissionCount: number
  recentAcceptedProblems: number
  recentAcceptedSubmissions: number
  tagStats: NormalizedCodeforcesTagStat[]
  tagBreadth: number
  averageSolvedProblemRating: number | null
  maxSolvedProblemRating: number | null
}

function toIsoStringFromEpoch(epochSeconds?: number) {
  return epochSeconds ? new Date(epochSeconds * 1000).toISOString() : null
}

function normalizeImageUrl(value?: string | null) {
  if (!value) {
    return null
  }

  if (value.startsWith('//')) {
    return `https:${value}`
  }

  return value
}

function buildCodeforcesProfileUrl(handle: string) {
  return `https://codeforces.com/profile/${handle}`
}

function buildDisplayName(user: CodeforcesUserResponse) {
  const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
  return displayName || user.handle
}

export function normalizeCodeforcesIdentity(
  user: CodeforcesUserResponse,
): NormalizedCodeforcesIdentity {
  return {
    provider: 'codeforces',
    providerUserId: user.handle,
    username: user.handle,
    displayName: buildDisplayName(user),
    profileUrl: buildCodeforcesProfileUrl(user.handle),
    avatarUrl: normalizeImageUrl(user.titlePhoto ?? user.avatar ?? null),
  }
}

export function normalizeCodeforcesContestResults(
  contests: CodeforcesContestResponse[],
): NormalizedCodeforcesContestResult[] {
  return [...contests]
    .map((contest) => ({
      contestId: contest.contestId,
      contestName: contest.contestName,
      rank: contest.rank,
      oldRating: contest.oldRating,
      newRating: contest.newRating,
      ratingDelta: contest.newRating - contest.oldRating,
      ratingUpdateTime: new Date(
        contest.ratingUpdateTimeSeconds * 1000,
      ).toISOString(),
    }))
    .sort(
      (left, right) =>
        new Date(left.ratingUpdateTime).getTime() -
        new Date(right.ratingUpdateTime).getTime(),
    )
}

function createProblemKey(submission: CodeforcesSubmissionResponse) {
  if (submission.problem.problemsetName) {
    return `${submission.problem.problemsetName}:${submission.problem.name}`
  }

  if (submission.problem.contestId) {
    return `${submission.problem.contestId}:${submission.problem.index}`
  }

  return submission.problem.name
}

function summarizeAcceptedSubmissions(
  submissions: CodeforcesSubmissionResponse[],
  referenceDate: Date,
): CodeforcesSubmissionSummary {
  const acceptedSubmissions = submissions.filter(
    (submission) => submission.verdict === 'OK',
  )
  const recentThreshold = referenceDate.getTime() - RECENT_WINDOW_DAYS * 24 * 60 * 60 * 1000
  const uniqueSolvedProblems = new Map<
    string,
    {
      solvedAt: number
      rating: number | null
      tags: string[]
    }
  >()
  const recentSolvedProblems = new Set<string>()
  const tagAggregation = new Map<
    string,
    { solvedCount: number; ratingTotal: number; ratingCount: number; maxRating: number | null }
  >()

  let recentAcceptedSubmissions = 0
  let ratingTotal = 0
  let ratedProblemCount = 0
  let maxSolvedProblemRating: number | null = null

  for (const submission of acceptedSubmissions) {
    const creationTime = submission.creationTimeSeconds * 1000

    if (creationTime >= recentThreshold) {
      recentAcceptedSubmissions += 1
    }

    const problemKey = createProblemKey(submission)
    const existingProblem = uniqueSolvedProblems.get(problemKey)

    if (existingProblem) {
      if (creationTime >= recentThreshold) {
        recentSolvedProblems.add(problemKey)
      }
      continue
    }

    const problemRating = submission.problem.rating ?? null
    const normalizedTags = [...new Set(submission.problem.tags)]

    uniqueSolvedProblems.set(problemKey, {
      solvedAt: creationTime,
      rating: problemRating,
      tags: normalizedTags,
    })

    if (creationTime >= recentThreshold) {
      recentSolvedProblems.add(problemKey)
    }

    if (problemRating !== null) {
      ratingTotal += problemRating
      ratedProblemCount += 1
      maxSolvedProblemRating =
        maxSolvedProblemRating === null
          ? problemRating
          : Math.max(maxSolvedProblemRating, problemRating)
    }

    for (const tag of normalizedTags) {
      const existingTag = tagAggregation.get(tag)

      if (!existingTag) {
        tagAggregation.set(tag, {
          solvedCount: 1,
          ratingTotal: problemRating ?? 0,
          ratingCount: problemRating === null ? 0 : 1,
          maxRating: problemRating,
        })
        continue
      }

      existingTag.solvedCount += 1

      if (problemRating !== null) {
        existingTag.ratingTotal += problemRating
        existingTag.ratingCount += 1
        existingTag.maxRating =
          existingTag.maxRating === null
            ? problemRating
            : Math.max(existingTag.maxRating, problemRating)
      }
    }
  }

  const tagStats = [...tagAggregation.entries()]
    .map<NormalizedCodeforcesTagStat>(([tagName, value]) => ({
      tagName,
      solvedCount: value.solvedCount,
      averageSolvedProblemRating:
        value.ratingCount === 0
          ? null
          : Math.round((value.ratingTotal / value.ratingCount) * 100) / 100,
      maxSolvedProblemRating: value.maxRating,
    }))
    .sort((left, right) => right.solvedCount - left.solvedCount)

  return {
    totalSolvedProblems: uniqueSolvedProblems.size,
    acceptedSubmissionCount: acceptedSubmissions.length,
    recentAcceptedProblems: recentSolvedProblems.size,
    recentAcceptedSubmissions,
    tagStats,
    tagBreadth: tagStats.length,
    averageSolvedProblemRating:
      ratedProblemCount === 0 ? null : Math.round((ratingTotal / ratedProblemCount) * 100) / 100,
    maxSolvedProblemRating,
  }
}

export function normalizeCodeforcesProfile(input: {
  user: CodeforcesUserResponse
  contests: CodeforcesContestResponse[]
  submissions: CodeforcesSubmissionResponse[]
  referenceDate?: Date
}): NormalizedCodeforcesProfile {
  const referenceDate = input.referenceDate ?? new Date()
  const identity = normalizeCodeforcesIdentity(input.user)
  const submissionSummary = summarizeAcceptedSubmissions(
    input.submissions,
    referenceDate,
  )
  const recentContestThreshold =
    referenceDate.getTime() - RECENT_CONTEST_WINDOW_DAYS * 24 * 60 * 60 * 1000
  const recentContests = input.contests.filter(
    (contest) => contest.ratingUpdateTimeSeconds * 1000 >= recentContestThreshold,
  ).length

  return {
    ...identity,
    rank: input.user.rank ?? null,
    maxRank: input.user.maxRank ?? null,
    currentRating: input.user.rating ?? null,
    maxRating: input.user.maxRating ?? null,
    contribution: input.user.contribution ?? null,
    friendOfCount: input.user.friendOfCount ?? null,
    organization: input.user.organization ?? null,
    country: input.user.country ?? null,
    city: input.user.city ?? null,
    registrationAt: toIsoStringFromEpoch(input.user.registrationTimeSeconds),
    lastOnlineAt: toIsoStringFromEpoch(input.user.lastOnlineTimeSeconds),
    totalContests: input.contests.length,
    recentContests,
    totalSolvedProblems: submissionSummary.totalSolvedProblems,
    acceptedSubmissionCount: submissionSummary.acceptedSubmissionCount,
    recentAcceptedProblems: submissionSummary.recentAcceptedProblems,
    recentAcceptedSubmissions: submissionSummary.recentAcceptedSubmissions,
    tagBreadth: submissionSummary.tagBreadth,
    averageSolvedProblemRating: submissionSummary.averageSolvedProblemRating,
    maxSolvedProblemRating: submissionSummary.maxSolvedProblemRating,
  }
}

export function normalizeCodeforcesSyncPayload(input: {
  user: CodeforcesUserResponse
  contests: CodeforcesContestResponse[]
  submissions: CodeforcesSubmissionResponse[]
  submissionsArePartial: boolean
  referenceDate?: Date
}): NormalizedCodeforcesSyncPayload {
  const referenceDate = input.referenceDate ?? new Date()
  const submissionSummary = summarizeAcceptedSubmissions(
    input.submissions,
    referenceDate,
  )

  return {
    profile: normalizeCodeforcesProfile({
      user: input.user,
      contests: input.contests,
      submissions: input.submissions,
      referenceDate,
    }),
    contestResults: normalizeCodeforcesContestResults(input.contests),
    tagStats: submissionSummary.tagStats,
    submissionsArePartial: input.submissionsArePartial,
  }
}
