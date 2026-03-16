import type { DeveloperType, LearningVelocity } from '@prisma/client'

import type { ProductMetaResponse } from '../types/api/product'
import type { ProductUserState } from '../services/product/productDataService'

export function presentProductMeta(userState: ProductUserState): ProductMetaResponse {
  return {
    state: userState.state,
    hasConnectedGithub: userState.hasConnectedGithub,
    hasSyncedData: userState.hasSyncedData,
    hasAnalysis: userState.hasAnalysis,
    lastSyncAt: userState.lastSyncAt?.toISOString() ?? null,
    lastAnalysisAt: userState.lastAnalysisAt?.toISOString() ?? null,
    metadataOnlyAnalysis: userState.metadataOnlyAnalysis,
    sourceCodeStorage: 'disabled',
  }
}

export function presentLearningVelocityLabel(learningVelocity: LearningVelocity | null) {
  if (!learningVelocity) {
    return null
  }

  const labels: Record<LearningVelocity, string> = {
    LOW: 'Low',
    MODERATE: 'Moderate',
    HIGH: 'High',
    ACCELERATING: 'Accelerating',
  }

  return labels[learningVelocity]
}

export function presentLearningVelocityValue(learningVelocity: LearningVelocity | null) {
  if (!learningVelocity) {
    return null
  }

  const values: Record<LearningVelocity, number> = {
    LOW: 28,
    MODERATE: 52,
    HIGH: 74,
    ACCELERATING: 88,
  }

  return values[learningVelocity]
}

export function presentDeveloperTypeLabel(developerType: DeveloperType | null) {
  if (!developerType) {
    return null
  }

  const labels: Record<DeveloperType, string> = {
    BUILDER: 'The Builder',
    ARCHITECT: 'The Architect',
    PROBLEM_SOLVER: 'The Problem Solver',
    EXPLORER: 'The Explorer',
  }

  return labels[developerType]
}

export function presentDeveloperTypeExplanation(developerType: DeveloperType | null) {
  if (!developerType) {
    return null
  }

  const explanations: Record<DeveloperType, string> = {
    BUILDER: 'This profile leans toward building and shipping practical projects with visible implementation momentum.',
    ARCHITECT: 'This profile shows a stronger lean toward backend, systems, and infrastructure-oriented engineering.',
    PROBLEM_SOLVER: 'This profile is shaped by explicit problem-solving signals and steady technical practice patterns.',
    EXPLORER: 'This profile stands out for technology breadth, experimentation, and expanding stack coverage over time.',
  }

  return explanations[developerType]
}

export function presentGenomeStatusLabel(score: number | null) {
  if (score === null) {
    return null
  }

  if (score >= 82) {
    return 'Advanced'
  }

  if (score >= 65) {
    return 'Established'
  }

  if (score >= 45) {
    return 'Emerging'
  }

  return 'Foundational'
}
