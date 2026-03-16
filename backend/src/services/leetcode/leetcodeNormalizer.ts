import type {
  LeetcodeTagProblemCount,
  LeetcodeUserSnapshotResponse,
  NormalizedLeetcodeLanguageStat,
  NormalizedLeetcodeProfile,
  NormalizedLeetcodeSyncPayload,
  NormalizedLeetcodeTopicStat,
} from './leetcodeTypes'

function buildLeetcodeProfileUrl(username: string) {
  return `https://leetcode.com/u/${username}/`
}

function getSolvedCountByDifficulty(
  snapshot: LeetcodeUserSnapshotResponse,
  difficulty: 'All' | 'Easy' | 'Medium' | 'Hard',
) {
  return (
    snapshot.matchedUser?.submitStatsGlobal?.acSubmissionNum.find(
      (entry) => entry.difficulty === difficulty,
    )?.count ?? 0
  )
}

function normalizeTopicGroup(
  category: NormalizedLeetcodeTopicStat['category'],
  topics: LeetcodeTagProblemCount[],
) {
  return topics
    .filter((topic) => topic.problemsSolved > 0)
    .map<NormalizedLeetcodeTopicStat>((topic) => ({
      category,
      topicName: topic.tagName,
      problemsSolved: topic.problemsSolved,
    }))
}

export function normalizeLeetcodeProfile(
  snapshot: LeetcodeUserSnapshotResponse,
): NormalizedLeetcodeProfile {
  const matchedUser = snapshot.matchedUser

  if (!matchedUser) {
    throw new Error('normalizeLeetcodeProfile requires a matched user')
  }

  return {
    provider: 'leetcode',
    providerUserId: matchedUser.username,
    username: matchedUser.username,
    displayName: matchedUser.profile?.realName ?? matchedUser.username,
    profileUrl: buildLeetcodeProfileUrl(matchedUser.username),
    avatarUrl: matchedUser.profile?.userAvatar ?? null,
    realName: matchedUser.profile?.realName ?? null,
    aboutMe: matchedUser.profile?.aboutMe ?? null,
    countryName: matchedUser.profile?.countryName ?? null,
    company: matchedUser.profile?.company ?? null,
    school: matchedUser.profile?.school ?? null,
    ranking: matchedUser.profile?.ranking ?? null,
    reputation: matchedUser.profile?.reputation ?? null,
    totalSolved: getSolvedCountByDifficulty(snapshot, 'All'),
    easySolved: getSolvedCountByDifficulty(snapshot, 'Easy'),
    mediumSolved: getSolvedCountByDifficulty(snapshot, 'Medium'),
    hardSolved: getSolvedCountByDifficulty(snapshot, 'Hard'),
    currentStreak: matchedUser.userCalendar?.streak ?? 0,
    totalActiveDays: matchedUser.userCalendar?.totalActiveDays ?? 0,
    activeYears: [...(matchedUser.userCalendar?.activeYears ?? [])].sort((left, right) => left - right),
    badgesCount: matchedUser.badges.length,
    contestRating: snapshot.userContestRanking?.rating ?? null,
    contestGlobalRanking: snapshot.userContestRanking?.globalRanking ?? null,
    contestTopPercentage: snapshot.userContestRanking?.topPercentage ?? null,
    attendedContestsCount: snapshot.userContestRanking?.attendedContestsCount ?? null,
  }
}

export function normalizeLeetcodeTopicStats(
  snapshot: LeetcodeUserSnapshotResponse,
): NormalizedLeetcodeTopicStat[] {
  const topicGroups = snapshot.matchedUser?.tagProblemCounts

  if (!topicGroups) {
    return []
  }

  return [
    ...normalizeTopicGroup('fundamental', topicGroups.fundamental),
    ...normalizeTopicGroup('intermediate', topicGroups.intermediate),
    ...normalizeTopicGroup('advanced', topicGroups.advanced),
  ].sort((left, right) => right.problemsSolved - left.problemsSolved)
}

export function normalizeLeetcodeLanguageStats(
  snapshot: LeetcodeUserSnapshotResponse,
): NormalizedLeetcodeLanguageStat[] {
  return [...(snapshot.matchedUser?.languageProblemCount ?? [])]
    .filter((language) => language.problemsSolved > 0)
    .map((language) => ({
      languageName: language.languageName,
      problemsSolved: language.problemsSolved,
    }))
    .sort((left, right) => right.problemsSolved - left.problemsSolved)
}

export function normalizeLeetcodeSyncPayload(
  snapshot: LeetcodeUserSnapshotResponse,
): NormalizedLeetcodeSyncPayload {
  return {
    profile: normalizeLeetcodeProfile(snapshot),
    topicStats: normalizeLeetcodeTopicStats(snapshot),
    languageStats: normalizeLeetcodeLanguageStats(snapshot),
  }
}
