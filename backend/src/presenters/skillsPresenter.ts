import { getRoleSkillRequirements } from '../services/analysis'
import type {
  LatestGenomeProfileRecord,
  LatestSkillGapReportRecord,
  ProductUserState,
} from '../services/product/productDataService'
import {
  CORE_SKILL_LABELS,
  getCoreSkillBreakdown,
  getStrongestAndWeakestCategories,
  summarizeSkillGapPriorities,
} from '../services/product/productUtils'
import type { SkillsResponse } from '../types/api/product'
import { presentProductMeta } from './productMetaPresenter'

function mapGenomeSkillScores(genomeProfile: LatestGenomeProfileRecord | null) {
  return {
    frontend: genomeProfile?.frontendScore ?? 0,
    backend: genomeProfile?.backendScore ?? 0,
    databases: genomeProfile?.databaseScore ?? 0,
    devops: genomeProfile?.devopsScore ?? 0,
    systemDesign: genomeProfile?.systemDesignScore ?? 0,
    algorithms: genomeProfile?.algorithmsScore ?? 0,
  }
}

export function presentSkills(input: {
  userState: ProductUserState
  genomeProfile: LatestGenomeProfileRecord | null
  preferredSkillGapReport: LatestSkillGapReportRecord | null
  fallbackTargetRole: string
}): SkillsResponse {
  const currentScores = mapGenomeSkillScores(input.genomeProfile)
  const targetRole = input.preferredSkillGapReport?.targetRole ?? input.fallbackTargetRole
  const roleRequirements = getRoleSkillRequirements(targetRole)
  const strongestAndWeakest = getStrongestAndWeakestCategories(input.genomeProfile)

  return {
    meta: presentProductMeta(input.userState),
    targetRole: {
      role: targetRole,
      readinessScore: input.preferredSkillGapReport?.matchScore ?? null,
      summary:
        input.preferredSkillGapReport?.summary ??
        (input.userState.state === 'needs_analysis'
          ? 'Run analysis to unlock detailed role-readiness guidance.'
          : null),
    },
    comparison: {
      items: CORE_SKILL_LABELS.map((item) => {
        const currentScore = currentScores[item.key]
        const targetScore =
          roleRequirements?.requiredScores[
            item.key as keyof typeof roleRequirements.requiredScores
          ] ?? 0

        return {
          category: item.key,
          label: item.label,
          currentScore,
          targetScore,
          gap: Math.max(targetScore - currentScore, 0),
        }
      }),
    },
    missingSkills: {
      items: summarizeSkillGapPriorities(
        input.preferredSkillGapReport?.missingSkills ?? [],
      ).map((missingSkill) => ({
        skill: missingSkill.skill,
        priority: missingSkill.priority,
        reason: `${missingSkill.skill} is below the current target-role threshold for ${targetRole}.`,
      })),
      emptyMessage:
        input.preferredSkillGapReport?.missingSkills.length
          ? null
          : input.userState.state === 'needs_analysis'
            ? 'Run analysis to generate role-based gap guidance.'
            : 'Current role fit looks strong across the tracked categories.',
    },
    learningPath: {
      steps: (input.preferredSkillGapReport?.learningSuggestions ?? []).map(
        (suggestion, index) => ({
          order: index + 1,
          title:
            input.preferredSkillGapReport?.missingSkills[index] ??
            `Next focus ${index + 1}`,
          description: suggestion,
        }),
      ),
    },
    suggestedProjects: {
      items: (input.preferredSkillGapReport?.recommendedProjects ?? []).map(
        (project, index) => ({
          title: `Project direction ${index + 1}`,
          focusAreas:
            input.preferredSkillGapReport?.missingSkills.slice(index, index + 2) ??
            strongestAndWeakest.weakest,
          whyItHelps: project,
          impact: index === 0 ? 'high' : 'medium',
        }),
      ),
    },
    strongAreas: {
      items: getCoreSkillBreakdown(input.genomeProfile)
        .sort((left, right) => right.value - left.value)
        .slice(0, 3)
        .map((item) => ({
          label: item.label,
          score: item.value,
          note: `${item.label} is one of the clearest current strengths in the metadata-based profile.`,
        })),
    },
  }
}
