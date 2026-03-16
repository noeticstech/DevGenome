import type { AnalysisSkillCategory, CoreSkillCategory } from './analysisTypes'

const FRONTEND_KEYWORDS = [
  'react',
  'next',
  'nextjs',
  'vue',
  'nuxt',
  'angular',
  'svelte',
  'frontend',
  'ui',
  'tailwind',
  'storybook',
  'design-system',
  'landing-page',
  'webapp',
]

const BACKEND_KEYWORDS = [
  'backend',
  'api',
  'server',
  'express',
  'nest',
  'fastify',
  'graphql',
  'rest',
  'microservice',
  'service',
  'auth',
  'oauth',
  'webhook',
  'worker',
]

const DATABASE_KEYWORDS = [
  'postgres',
  'postgresql',
  'mysql',
  'mongo',
  'mongodb',
  'redis',
  'sqlite',
  'database',
  'db',
  'prisma',
  'supabase',
  'orm',
  'sql',
]

const DEVOPS_KEYWORDS = [
  'docker',
  'kubernetes',
  'k8s',
  'terraform',
  'ansible',
  'helm',
  'aws',
  'azure',
  'gcp',
  'github-actions',
  'ci',
  'cd',
  'cicd',
  'pipeline',
  'infra',
  'devops',
  'deployment',
]

const SYSTEM_DESIGN_KEYWORDS = [
  'architecture',
  'architect',
  'scalable',
  'distributed',
  'event-driven',
  'queue',
  'messaging',
  'gateway',
  'service-mesh',
  'system-design',
]

const ALGORITHMS_KEYWORDS = [
  'leetcode',
  'dsa',
  'algorithm',
  'algorithms',
  'competitive-programming',
  'problem-solving',
  'codeforces',
  'interview-prep',
  'data-structures',
]

const SECURITY_KEYWORDS = [
  'security',
  'secure',
  'auth',
  'oauth',
  'jwt',
  'rbac',
  'encryption',
  'iam',
  'permissions',
]

const TESTING_KEYWORDS = [
  'test',
  'testing',
  'jest',
  'vitest',
  'cypress',
  'playwright',
  'integration-test',
  'unit-test',
]

const FRONTEND_LANGUAGES = new Set([
  'javascript',
  'typescript',
  'html',
  'css',
  'scss',
  'sass',
  'jsx',
  'tsx',
])

const BACKEND_LANGUAGES = new Set([
  'javascript',
  'typescript',
  'python',
  'java',
  'go',
  'rust',
  'ruby',
  'php',
  'c#',
  'csharp',
  'kotlin',
  'scala',
])

const DATABASE_LANGUAGES = new Set(['sql', 'plpgsql'])
const DEVOPS_LANGUAGES = new Set(['dockerfile', 'shell', 'bash', 'hcl', 'yaml'])

const SUPPORTED_TARGET_ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'DevOps Engineer',
  'Software Engineer',
] as const

export type SupportedTargetRole = (typeof SUPPORTED_TARGET_ROLES)[number]

export function clampScore(value: number, min = 0, max = 100) {
  return Math.min(Math.max(Math.round(value), min), max)
}

export function scaleToRange(value: number, maxInput: number, maxPoints: number) {
  if (maxInput <= 0 || maxPoints <= 0) {
    return 0
  }

  return Math.min(value / maxInput, 1) * maxPoints
}

export function average(values: number[]) {
  if (values.length === 0) {
    return 0
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length
}

export function sortDescending(values: Array<{ label: string; value: number }>) {
  return [...values].sort((left, right) => right.value - left.value)
}

export function daysAgo(date: Date | null, reference = new Date()) {
  if (!date) {
    return Number.POSITIVE_INFINITY
  }

  return Math.floor((reference.getTime() - date.getTime()) / (24 * 60 * 60 * 1000))
}

export function isWithinDays(date: Date | null, days: number, reference = new Date()) {
  return Boolean(date) && daysAgo(date, reference) <= days
}

export function normalizeTerm(value: string) {
  return value.trim().toLowerCase()
}

export function normalizeTerms(values: Array<string | null | undefined>) {
  return values
    .flatMap((value) =>
      value
        ? value
            .toLowerCase()
            .replace(/[^a-z0-9+#.\-/ ]+/g, ' ')
            .split(/[\s_/.-]+/)
            .filter(Boolean)
        : [],
    )
}

export function buildRepositoryText(values: Array<string | null | undefined>) {
  return normalizeTerms(values).join(' ')
}

export function matchKeywords(text: string, keywords: string[]) {
  return keywords.filter((keyword) => text.includes(keyword))
}

export function uniqueStrings(values: string[]) {
  return [...new Set(values)]
}

export function matchesLanguageGroup(languages: string[], languageGroup: Set<string>) {
  return languages.some((language) => languageGroup.has(normalizeTerm(language)))
}

export function getFrontendKeywordMatches(text: string) {
  return matchKeywords(text, FRONTEND_KEYWORDS)
}

export function getBackendKeywordMatches(text: string) {
  return matchKeywords(text, BACKEND_KEYWORDS)
}

export function getDatabaseKeywordMatches(text: string) {
  return matchKeywords(text, DATABASE_KEYWORDS)
}

export function getDevopsKeywordMatches(text: string) {
  return matchKeywords(text, DEVOPS_KEYWORDS)
}

export function getSystemDesignKeywordMatches(text: string) {
  return matchKeywords(text, SYSTEM_DESIGN_KEYWORDS)
}

export function getAlgorithmsKeywordMatches(text: string) {
  return matchKeywords(text, ALGORITHMS_KEYWORDS)
}

export function getSecurityKeywordMatches(text: string) {
  return matchKeywords(text, SECURITY_KEYWORDS)
}

export function getTestingKeywordMatches(text: string) {
  return matchKeywords(text, TESTING_KEYWORDS)
}

export function isFrontendLanguageSignal(languages: string[]) {
  return matchesLanguageGroup(languages, FRONTEND_LANGUAGES)
}

export function isBackendLanguageSignal(languages: string[]) {
  return matchesLanguageGroup(languages, BACKEND_LANGUAGES)
}

export function isDatabaseLanguageSignal(languages: string[]) {
  return matchesLanguageGroup(languages, DATABASE_LANGUAGES)
}

export function isDevopsLanguageSignal(languages: string[]) {
  return matchesLanguageGroup(languages, DEVOPS_LANGUAGES)
}

export function topLabelsByValue(record: Record<string, number>, limit: number) {
  return Object.entries(record)
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([label]) => label)
}

export function humanizeCategory(category: AnalysisSkillCategory | 'testing') {
  const labels: Record<AnalysisSkillCategory | 'testing', string> = {
    algorithms: 'Algorithms',
    backend: 'Backend',
    frontend: 'Frontend',
    databases: 'Databases',
    devops: 'DevOps',
    systemDesign: 'System Design',
    security: 'Security',
    collaboration: 'Collaboration',
    testing: 'Testing',
  }

  return labels[category]
}

export function pickStrongestCoreCategories(
  scores: Record<CoreSkillCategory, number>,
  limit = 2,
) {
  return Object.entries(scores)
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([category]) => humanizeCategory(category as CoreSkillCategory))
}

export function normalizeTargetRole(value: string | null | undefined): SupportedTargetRole {
  const normalizedValue = value?.trim().toLowerCase()

  const matchedRole = SUPPORTED_TARGET_ROLES.find(
    (role) => role.toLowerCase() === normalizedValue,
  )

  return matchedRole ?? 'Software Engineer'
}

export function getSupportedTargetRoles() {
  return [...SUPPORTED_TARGET_ROLES]
}
