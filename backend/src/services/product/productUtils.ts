import type { ChartDatum } from '../../types/api/product'
import type {
  LatestGenomeProfileRecord,
  LatestSkillGapReportRecord,
} from './productDataService'

export const CORE_SKILL_LABELS: Array<{
  key: 'algorithms' | 'backend' | 'frontend' | 'devops' | 'databases' | 'systemDesign'
  label: string
}> = [
  { key: 'algorithms', label: 'Algorithms' },
  { key: 'backend', label: 'Backend' },
  { key: 'frontend', label: 'Frontend' },
  { key: 'devops', label: 'DevOps' },
  { key: 'databases', label: 'Databases' },
  { key: 'systemDesign', label: 'System Design' },
]

export function getCoreSkillBreakdown(
  genomeProfile: LatestGenomeProfileRecord | null,
): ChartDatum[] {
  const scoreMap = genomeProfile
    ? {
        algorithms: genomeProfile.algorithmsScore,
        backend: genomeProfile.backendScore,
        frontend: genomeProfile.frontendScore,
        devops: genomeProfile.devopsScore,
        databases: genomeProfile.databaseScore,
        systemDesign: genomeProfile.systemDesignScore,
      }
    : {
        algorithms: 0,
        backend: 0,
        frontend: 0,
        devops: 0,
        databases: 0,
        systemDesign: 0,
      }

  return CORE_SKILL_LABELS.map((item) => ({
    key: item.key,
    label: item.label,
    value: scoreMap[item.key],
  }))
}

export function getStrongestAndWeakestCategories(
  genomeProfile: LatestGenomeProfileRecord | null,
) {
  const skillBreakdown = getCoreSkillBreakdown(genomeProfile)
  const sortedSkills = [...skillBreakdown].sort((left, right) => right.value - left.value)

  return {
    strongest: sortedSkills.slice(0, 2).map((item) => item.label),
    weakest: sortedSkills.slice(-2).reverse().map((item) => item.label),
  }
}

export function selectPreferredSkillGapReport(input: {
  reports: LatestSkillGapReportRecord[]
  targetRole: string | null
}) {
  if (input.reports.length === 0) {
    return null
  }

  if (input.targetRole) {
    const matchingReport = input.reports.find(
      (report) => report.targetRole.toLowerCase() === input.targetRole?.toLowerCase(),
    )

    if (matchingReport) {
      return matchingReport
    }
  }

  return [...input.reports].sort((left, right) => right.matchScore - left.matchScore)[0]
}

export function getSecondarySkillGapReport(input: {
  reports: LatestSkillGapReportRecord[]
  preferredTargetRole: string | null
}) {
  const sortedReports = [...input.reports].sort(
    (left, right) => right.matchScore - left.matchScore,
  )

  return sortedReports.find(
    (report) => report.targetRole !== input.preferredTargetRole,
  ) ?? null
}

export function summarizeSkillGapPriorities(missingSkills: string[]) {
  return missingSkills.map((skill, index) => ({
    skill,
    priority: index === 0 ? 'high' : index === 1 ? 'medium' : 'low',
  })) as Array<{
    skill: string
    priority: 'high' | 'medium' | 'low'
  }>
}
