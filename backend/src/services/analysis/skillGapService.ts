import { LearningVelocity } from '@prisma/client'

import type {
  DerivedAnalysisSignals,
  LearningVelocityResult,
  RoleSkillGapReport,
  SkillScoringResult,
} from './analysisTypes'
import { getSupportedTargetRoles, humanizeCategory, normalizeTargetRole } from './analysisUtils'
import { getInterviewReadinessLabel } from './fusion/fusionEngine'
import type { FusedAnalysisSignals } from './fusion/fusionTypes'

type RoleProfile = {
  requiredScores: Record<
    'frontend' | 'backend' | 'databases' | 'devops' | 'systemDesign' | 'algorithms',
    number
  >
  weights: Record<
    'frontend' | 'backend' | 'databases' | 'devops' | 'systemDesign' | 'algorithms',
    number
  >
  defaultProjects: string[]
}

const ROLE_PROFILES: Record<string, RoleProfile> = {
  'Frontend Developer': {
    requiredScores: {
      frontend: 72,
      backend: 42,
      databases: 32,
      devops: 25,
      systemDesign: 34,
      algorithms: 28,
    },
    weights: {
      frontend: 0.38,
      backend: 0.15,
      databases: 0.1,
      devops: 0.08,
      systemDesign: 0.14,
      algorithms: 0.15,
    },
    defaultProjects: [
      'Build a polished React or Next.js product with strong state management and accessibility.',
      'Ship a frontend application with testing, API integration, and performance budgets.',
      'Create a reusable design system or component library with Storybook.',
    ],
  },
  'Backend Developer': {
    requiredScores: {
      frontend: 25,
      backend: 74,
      databases: 60,
      devops: 42,
      systemDesign: 56,
      algorithms: 38,
    },
    weights: {
      frontend: 0.05,
      backend: 0.34,
      databases: 0.2,
      devops: 0.12,
      systemDesign: 0.17,
      algorithms: 0.12,
    },
    defaultProjects: [
      'Design and document a production-style API service with auth, queues, and observability.',
      'Build a backend project with a relational database, migrations, and caching.',
      'Ship a service that handles scaling, background processing, and deployment concerns.',
    ],
  },
  'Full Stack Developer': {
    requiredScores: {
      frontend: 66,
      backend: 66,
      databases: 54,
      devops: 38,
      systemDesign: 46,
      algorithms: 34,
    },
    weights: {
      frontend: 0.24,
      backend: 0.24,
      databases: 0.16,
      devops: 0.12,
      systemDesign: 0.14,
      algorithms: 0.1,
    },
    defaultProjects: [
      'Launch an end-to-end SaaS-style product with a polished frontend and production backend.',
      'Build a full stack app with authentication, analytics, and a managed deployment pipeline.',
      'Create a project that mixes frontend UX, API design, and durable data modeling.',
    ],
  },
  'DevOps Engineer': {
    requiredScores: {
      frontend: 18,
      backend: 52,
      databases: 42,
      devops: 78,
      systemDesign: 54,
      algorithms: 24,
    },
    weights: {
      frontend: 0.03,
      backend: 0.18,
      databases: 0.12,
      devops: 0.38,
      systemDesign: 0.17,
      algorithms: 0.12,
    },
    defaultProjects: [
      'Containerize and deploy a service with CI/CD, monitoring, and IaC.',
      'Build a deployment platform or internal tooling project with observability baked in.',
      'Create a resilient infrastructure workflow using Docker, Terraform, and GitHub Actions.',
    ],
  },
  'Software Engineer': {
    requiredScores: {
      frontend: 48,
      backend: 56,
      databases: 44,
      devops: 34,
      systemDesign: 46,
      algorithms: 42,
    },
    weights: {
      frontend: 0.16,
      backend: 0.22,
      databases: 0.14,
      devops: 0.12,
      systemDesign: 0.18,
      algorithms: 0.18,
    },
    defaultProjects: [
      'Build a balanced product that combines solid implementation, architecture, and delivery practices.',
      'Ship a production-style application that demonstrates both systems thinking and execution depth.',
      'Create a portfolio project that mixes problem solving, APIs, persistence, and user-facing polish.',
    ],
  },
}

const CATEGORY_KEYS = [
  'frontend',
  'backend',
  'databases',
  'devops',
  'systemDesign',
  'algorithms',
] as const

function getScore(skillScores: SkillScoringResult, category: (typeof CATEGORY_KEYS)[number]) {
  return skillScores.scores[category].score
}

function buildAlgorithmsSuggestion(fusion: FusedAnalysisSignals) {
  if (fusion.sourceCoverage.problemSolvingSources.includes('leetcode') || fusion.sourceCoverage.problemSolvingSources.includes('codeforces')) {
    return 'Turn your existing practice into stronger interview-ready evidence by keeping a steady LeetCode/Codeforces cadence and pairing it with one public algorithms or interview-prep repository.'
  }

  return 'Add direct interview-practice evidence through LeetCode or Codeforces, then pair it with one public algorithms repository to make problem-solving depth easier to verify.'
}

function createLearningSuggestions(
  targetRole: string,
  missingCategories: (typeof CATEGORY_KEYS)[number][],
  learningVelocity: LearningVelocityResult,
  fusion: FusedAnalysisSignals,
) {
  const suggestions: string[] = missingCategories.slice(0, 3).map((category) => {
    if (category === 'frontend') {
      return 'Strengthen frontend depth with a polished product UI, accessibility, and state management work.'
    }

    if (category === 'backend') {
      return 'Strengthen backend depth with an API-driven service, auth flows, and production-style architecture.'
    }

    if (category === 'databases') {
      return 'Add a data-heavy project that models real workflows with a relational database and clear query patterns.'
    }

    if (category === 'devops') {
      return 'Add deployment and infrastructure signals with Docker, CI/CD, monitoring, or infrastructure-as-code.'
    }

    if (category === 'systemDesign') {
      return 'Show more architecture depth through multi-service design, scalability decisions, or event-driven workflows.'
    }

    return buildAlgorithmsSuggestion(fusion)
  })

  if (
    learningVelocity.label === LearningVelocity.LOW ||
    learningVelocity.label === LearningVelocity.MODERATE
  ) {
    suggestions.push(
      'Keep a steady recent build cadence so improvement signals stay visible in repository activity and linked practice platforms.',
    )
  }

  if (
    missingCategories.includes('algorithms') &&
    !fusion.sourceCoverage.problemSolvingSources.includes('leetcode') &&
    !fusion.sourceCoverage.problemSolvingSources.includes('codeforces')
  ) {
    suggestions.push(
      `For ${targetRole}, adding a visible interview-practice routine will strengthen algorithms confidence faster than GitHub-only metadata can.`,
    )
  }

  return suggestions.slice(0, 4)
}

function buildInterviewReadinessNote(
  targetRole: string,
  fusion: FusedAnalysisSignals,
  algorithmsWeight: number,
) {
  if (algorithmsWeight < 0.12) {
    return undefined
  }

  const readinessLabel = getInterviewReadinessLabel(fusion.interviewReadiness.score)
  const topSource = fusion.interviewReadiness.contributions[0]?.source

  if (!topSource) {
    return `${targetRole} interview-readiness is still inferred conservatively because direct problem-solving evidence is limited.`
  }

  if (readinessLabel === 'advanced' || readinessLabel === 'strong') {
    return `${targetRole} interview-readiness is ${readinessLabel}, led by ${topSource === 'github' ? 'GitHub' : topSource === 'leetcode' ? 'LeetCode' : 'Codeforces'} and reinforced by structured problem-solving signals from multiple sources where available.`
  }

  return `${targetRole} interview-readiness is ${readinessLabel}, so more direct algorithms practice would make role-fit reasoning stronger than GitHub-only metadata can.`
}

export function calculateSkillGapReports(input: {
  signals: DerivedAnalysisSignals
  skillScores: SkillScoringResult
  learningVelocity: LearningVelocityResult
  preferredRole: string | null | undefined
  fusion: FusedAnalysisSignals
}): {
  preferredTargetRole: string
  reports: RoleSkillGapReport[]
} {
  const preferredTargetRole = normalizeTargetRole(input.preferredRole)

  const reports = getSupportedTargetRoles().map((targetRole) => {
    const roleProfile = ROLE_PROFILES[targetRole]

    const readinessScore = Math.round(
      CATEGORY_KEYS.reduce((total, category) => {
        const currentScore = getScore(input.skillScores, category)
        const requiredScore = roleProfile.requiredScores[category]
        const categoryWeight = roleProfile.weights[category]

        return total + Math.min(currentScore / requiredScore, 1) * categoryWeight
      }, 0) * 100,
    )

    const strongestAreas = CATEGORY_KEYS
      .filter(
        (category) =>
          getScore(input.skillScores, category) >= roleProfile.requiredScores[category] - 4,
      )
      .sort(
        (left, right) =>
          getScore(input.skillScores, right) - roleProfile.requiredScores[right] -
          (getScore(input.skillScores, left) - roleProfile.requiredScores[left]),
      )
      .slice(0, 3)
      .map((category) => humanizeCategory(category))

    const missingCategories = CATEGORY_KEYS.filter(
      (category) => getScore(input.skillScores, category) + 5 < roleProfile.requiredScores[category],
    )

    const missingSkills = missingCategories.map((category) => humanizeCategory(category))
    const recommendedLearningAreas = createLearningSuggestions(
      targetRole,
      missingCategories,
      input.learningVelocity,
      input.fusion,
    )
    const suggestedProjects = [
      ...recommendedLearningAreas
        .filter((suggestion) => suggestion.startsWith('Add ') || suggestion.startsWith('Strengthen '))
        .map((suggestion) => suggestion.replace('Strengthen ', 'Build ').replace('Add ', 'Build ')),
      ...roleProfile.defaultProjects,
    ].slice(0, 3)

    const interviewReadinessNote = buildInterviewReadinessNote(
      targetRole,
      input.fusion,
      roleProfile.weights.algorithms,
    )

    const summary =
      missingSkills.length === 0
        ? `${targetRole} readiness is strong based on current metadata-only analysis, with the clearest strengths in ${strongestAreas.join(', ')}.${interviewReadinessNote ? ` ${interviewReadinessNote}` : ''}`
        : `${targetRole} readiness is ${readinessScore}%. Strongest areas are ${strongestAreas.join(', ') || 'still emerging'}, while the biggest gaps are ${missingSkills.join(', ')}.${interviewReadinessNote ? ` ${interviewReadinessNote}` : ''}`

    return {
      targetRole,
      readinessScore,
      strongestAreas,
      missingSkills,
      recommendedLearningAreas,
      suggestedProjects,
      summary,
      interviewReadinessNote,
    }
  })

  return {
    preferredTargetRole,
    reports,
  }
}

export function getRoleSkillRequirements(targetRole: string) {
  const normalizedRole = normalizeTargetRole(targetRole)
  return ROLE_PROFILES[normalizedRole]
}
