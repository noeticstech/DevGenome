import type { DeveloperType, LearningVelocity, TimelineEventType } from '@prisma/client'

export type CoreSkillCategory =
  | 'algorithms'
  | 'backend'
  | 'frontend'
  | 'databases'
  | 'devops'
  | 'systemDesign'

export type AnalysisSource = 'github' | 'leetcode' | 'codeforces'

export type AnalysisSkillCategory =
  | CoreSkillCategory
  | 'security'
  | 'collaboration'

export interface AnalysisSourceContribution {
  source: AnalysisSource
  score: number
  weight: number
  note: string
}

export interface AnalysisContextUser {
  id: string
  displayName: string | null
  username: string | null
  createdAt: Date
  preference: {
    targetRole: string | null
    metadataOnlyAnalysis: boolean
    sourceCodeStorageDisabled: boolean
  } | null
}

export interface AnalysisContextLanguageStat {
  languageName: string
  bytesCount: number
  percentage: number
}

export interface AnalysisContextCommitSummary {
  bucketType: 'DAY' | 'WEEK' | 'MONTH'
  bucketStart: Date
  bucketEnd: Date
  commitCount: number
  activeDays: number
}

export interface AnalysisContextRepository {
  id: string
  name: string
  fullName: string
  description: string | null
  isFork: boolean
  isArchived: boolean
  visibility: 'PUBLIC' | 'PRIVATE' | 'INTERNAL'
  primaryLanguage: string | null
  defaultBranch: string | null
  repoUrl: string
  topics: string[]
  starsCount: number
  forksCount: number
  openIssuesCount: number
  providerCreatedAt: Date | null
  providerUpdatedAt: Date | null
  lastPushedAt: Date | null
  languageStats: AnalysisContextLanguageStat[]
  commitSummaries: AnalysisContextCommitSummary[]
}

export interface AnalysisContextLeetcodeTopicStat {
  category: 'FUNDAMENTAL' | 'INTERMEDIATE' | 'ADVANCED'
  topicName: string
  problemsSolved: number
}

export interface AnalysisContextLeetcodeLanguageStat {
  languageName: string
  problemsSolved: number
}

export interface AnalysisContextLeetcodeProfile {
  username: string
  totalSolved: number
  easySolved: number
  mediumSolved: number
  hardSolved: number
  currentStreak: number
  totalActiveDays: number
  activeYears: number[]
  ranking: number | null
  contestRating: number | null
  contestGlobalRanking: number | null
  contestTopPercentage: number | null
  attendedContestsCount: number | null
  topicStats: AnalysisContextLeetcodeTopicStat[]
  languageStats: AnalysisContextLeetcodeLanguageStat[]
}

export interface AnalysisContextCodeforcesContestResult {
  contestId: number
  contestName: string
  rank: number
  oldRating: number
  newRating: number
  ratingDelta: number
  ratingUpdateTime: Date
}

export interface AnalysisContextCodeforcesTagStat {
  tagName: string
  solvedCount: number
  averageSolvedProblemRating: number | null
  maxSolvedProblemRating: number | null
}

export interface AnalysisContextCodeforcesProfile {
  handle: string
  rank: string | null
  maxRank: string | null
  currentRating: number | null
  maxRating: number | null
  totalContests: number
  recentContests: number
  totalSolvedProblems: number
  acceptedSubmissionCount: number
  recentAcceptedProblems: number
  recentAcceptedSubmissions: number
  tagBreadth: number
  averageSolvedProblemRating: number | null
  maxSolvedProblemRating: number | null
  contestResults: AnalysisContextCodeforcesContestResult[]
  tagStats: AnalysisContextCodeforcesTagStat[]
}

export interface AnalysisContext {
  user: AnalysisContextUser
  repositories: AnalysisContextRepository[]
  leetcodeProfile: AnalysisContextLeetcodeProfile | null
  codeforcesProfile: AnalysisContextCodeforcesProfile | null
}

export interface RepositoryCategorySignal {
  frontend: boolean
  backend: boolean
  databases: boolean
  devops: boolean
  systemDesign: boolean
  algorithms: boolean
  security: boolean
  testing: boolean
}

export interface RepositorySignal {
  repositoryId: string
  name: string
  fullName: string
  createdAt: Date | null
  updatedAt: Date | null
  lastPushedAt: Date | null
  primaryLanguage: string | null
  languages: string[]
  categories: RepositoryCategorySignal
  matchedKeywords: Partial<Record<AnalysisSkillCategory | 'testing', string[]>>
  isRecent: boolean
  isActive: boolean
  hasRecentActivity: boolean
}

export interface LanguageAdoptionSignal {
  languageName: string
  firstSeenAt: Date
  repositoryFullName: string
}

export interface CategoryMilestoneSignal {
  category: CoreSkillCategory | 'security'
  firstSeenAt: Date
  repositoryFullName: string
}

export interface WeeklyActivitySignal {
  bucketStart: Date
  bucketEnd: Date
  commitCount: number
  activeDays: number
}

export interface DerivedAnalysisSignals {
  generatedAt: Date
  totalRepositories: number
  publicRepositoryCount: number
  nonForkRepositoryCount: number
  archivedRepositoryCount: number
  activeRepositoryCount: number
  recentRepositoryCount: number
  multiCategoryRepositoryCount: number
  totalStars: number
  totalForks: number
  uniqueLanguages: string[]
  dominantLanguages: string[]
  languageBreadth: number
  frontendProjectCount: number
  backendProjectCount: number
  databaseProjectCount: number
  devopsProjectCount: number
  systemDesignProjectCount: number
  algorithmProjectCount: number
  securityProjectCount: number
  testingProjectCount: number
  stackDiversity: number
  experimentationIndex: number
  recentCommitCount: number
  priorCommitCount: number
  totalCommitCount: number
  recentActiveWeeks: number
  priorActiveWeeks: number
  totalActiveWeeks: number
  averageRecentActiveDays: number
  latestRepositoryAt: Date | null
  latestActivityAt: Date | null
  firstRepositoryAt: Date | null
  languageAdoptions: LanguageAdoptionSignal[]
  recentLanguageAdoptions: LanguageAdoptionSignal[]
  categoryMilestones: CategoryMilestoneSignal[]
  weeklyActivity: WeeklyActivitySignal[]
  repositories: RepositorySignal[]
  languageBytesByName: Record<string, number>
  leetcodeProfilePresent: boolean
  leetcodeTotalSolved: number
  leetcodeEasySolved: number
  leetcodeMediumSolved: number
  leetcodeHardSolved: number
  leetcodeCurrentStreak: number
  leetcodeTotalActiveDays: number
  leetcodeTopicBreadth: number
  leetcodeLanguageBreadth: number
  leetcodeContestParticipationCount: number
  leetcodeContestRating: number | null
  codeforcesProfilePresent: boolean
  codeforcesCurrentRating: number | null
  codeforcesMaxRating: number | null
  codeforcesContestCount: number
  codeforcesRecentContestCount: number
  codeforcesTotalSolvedProblems: number
  codeforcesAcceptedSubmissionCount: number
  codeforcesRecentAcceptedProblems: number
  codeforcesTagBreadth: number
  codeforcesAverageSolvedProblemRating: number | null
  codeforcesMaxSolvedProblemRating: number | null
  codeforcesLatestContestAt: Date | null
}

export interface SkillScoreDetail {
  score: number
  reasons: string[]
  sourceContributions?: AnalysisSourceContribution[]
}

export type SkillScoreMap = Record<AnalysisSkillCategory, SkillScoreDetail>

export interface SkillScoringResult {
  scores: SkillScoreMap
  strongestCategories: AnalysisSkillCategory[]
}

export interface GenomeScoreResult {
  overallScore: number
  componentScores: {
    breadth: number
    consistency: number
    depth: number
    recency: number
    growth: number
  }
  explanation: string
  summary: string
}

export interface DeveloperArchetypeResult {
  developerType: DeveloperType
  label: string
  explanation: string
  dominantSignals: string[]
  fitScores: Record<DeveloperType, number>
  sourceContributions?: AnalysisSourceContribution[]
}

export interface LearningVelocityResult {
  label: LearningVelocity
  score: number
  explanation: string
  supportingSignals: string[]
  sourceContributions?: AnalysisSourceContribution[]
}

export interface RoleSkillGapReport {
  targetRole: string
  readinessScore: number
  strongestAreas: string[]
  missingSkills: string[]
  recommendedLearningAreas: string[]
  suggestedProjects: string[]
  summary: string
  interviewReadinessNote?: string
}

export interface GeneratedTimelineEvent {
  title: string
  description: string
  eventDate: Date
  eventType: TimelineEventType
  metadata?: Record<string, unknown>
}

export interface DevGenomeAnalysisResult {
  userId: string
  generatedAt: string
  genome: GenomeScoreResult
  skills: SkillScoringResult
  developerType: DeveloperArchetypeResult
  learningVelocity: LearningVelocityResult
  preferredTargetRole: string
  skillGapReports: RoleSkillGapReport[]
  timelineEvents: GeneratedTimelineEvent[]
  warnings: string[]
  fusionSummary?: {
    interviewReadinessScore: number
    interviewReadinessLabel: string
    problemSolvingSources: AnalysisSource[]
    growthSources: AnalysisSource[]
  }
}
