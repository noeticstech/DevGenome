import type {
  AnalysisSkillCategory,
  AnalysisSource,
  AnalysisSourceContribution,
} from '../analysisTypes'

export interface SourceSignalDimension {
  score: number
  note: string
}

export interface GithubSourceSignals {
  available: boolean
  summary: string
  projectExecution: SourceSignalDimension
  frontend: SourceSignalDimension
  backend: SourceSignalDimension
  databases: SourceSignalDimension
  devops: SourceSignalDimension
  systemDesign: SourceSignalDimension
  algorithms: SourceSignalDimension
  security: SourceSignalDimension
  collaboration: SourceSignalDimension
  exploration: SourceSignalDimension
  growth: SourceSignalDimension
  problemSolving: SourceSignalDimension
  interview: SourceSignalDimension
}

export interface LeetcodeSourceSignals {
  available: boolean
  summary: string
  algorithms: SourceSignalDimension
  exploration: SourceSignalDimension
  growth: SourceSignalDimension
  problemSolving: SourceSignalDimension
  interview: SourceSignalDimension
}

export interface CodeforcesSourceSignals {
  available: boolean
  summary: string
  algorithms: SourceSignalDimension
  exploration: SourceSignalDimension
  growth: SourceSignalDimension
  problemSolving: SourceSignalDimension
  interview: SourceSignalDimension
}

export interface SourceSignals {
  github: GithubSourceSignals
  leetcode: LeetcodeSourceSignals
  codeforces: CodeforcesSourceSignals
}

export interface FusedDimension {
  score: number
  confidence: number
  explanation: string[]
  contributions: AnalysisSourceContribution[]
}

export interface FusedAnalysisSignals {
  sourceSignals: SourceSignals
  categorySignals: Record<AnalysisSkillCategory, FusedDimension>
  builderStrength: FusedDimension
  problemSolvingStrength: FusedDimension
  explorationStrength: FusedDimension
  interviewReadiness: FusedDimension
  growthMomentum: FusedDimension
  sourceCoverage: {
    connectedSources: AnalysisSource[]
    problemSolvingSources: AnalysisSource[]
  }
}
