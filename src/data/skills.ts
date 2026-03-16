import { BookMarked, BriefcaseBusiness, Database, ShieldAlert, Sparkles } from 'lucide-react'

import type { LearningStep } from '@/types'

export const skillGapOverview = {
  targetRole: 'Full Stack Platform Lead',
  match: 72,
}

export const skillComparison = [
  { label: 'Frontend', current: 88, target: 96 },
  { label: 'Backend', current: 74, target: 90 },
  { label: 'Databases', current: 43, target: 78 },
  { label: 'Auth', current: 28, target: 84 },
  { label: 'API Security', current: 35, target: 70 },
  { label: 'System Design', current: 63, target: 82 },
  { label: 'DevOps', current: 22, target: 65 },
  { label: 'Testing', current: 84, target: 92 },
]

export const readinessBreakdown = [
  { label: 'Frontend', value: 88 },
  { label: 'Backend', value: 74 },
  { label: 'Infrastructure', value: 41 },
  { label: 'Production', value: 36 },
]

export const criticalSkillGaps = [
  {
    title: 'Authentication systems',
    description: 'Missing depth in OAuth2, JWT architecture, and permission modeling.',
    priority: 'High priority',
    accent: 'red' as const,
    icon: ShieldAlert,
  },
  {
    title: 'Database indexing',
    description: 'Query planning and indexing strategy are the biggest scale blockers right now.',
    priority: 'Medium',
    accent: 'orange' as const,
    icon: Database,
  },
  {
    title: 'Production ownership',
    description: 'Deployment, observability, and rollback confidence need more hands-on reps.',
    priority: 'High leverage',
    accent: 'blue' as const,
    icon: Sparkles,
  },
]

export const skillLearningPath: LearningStep[] = [
  {
    stage: 'Step 1',
    title: 'Authentication fundamentals',
    description: 'Master JWT, OAuth, and session management patterns that appear in modern SaaS systems.',
    duration: 'Est. 12 hours',
    outcomes: ['Build login flows with token rotation', 'Understand permission boundaries'],
  },
  {
    stage: 'Step 2',
    title: 'Secure REST APIs',
    description: 'Focus on middleware, validation, rate limiting, and the operational shape of secure APIs.',
    duration: 'Est. 20 hours',
    outcomes: ['Express security middleware', 'Threat modeling for public endpoints'],
  },
  {
    stage: 'Step 3',
    title: 'Database optimization',
    description: 'Practice indexing, explain plans, and schema tradeoffs using realistic production workloads.',
    duration: 'Est. 16 hours',
    outcomes: ['Tune hot queries', 'Model scale-aware schema decisions'],
  },
]

export const skillProjects = [
  {
    title: 'Build a full stack auth app',
    badge: 'High impact',
    description:
      'Implement Next.js with Auth.js, token rotation, protected routes, and production-ready middleware.',
    icon: BriefcaseBusiness,
  },
  {
    title: 'Create a REST API with RBAC',
    badge: 'Portfolio project',
    description:
      'Design a role-based API with audit logs, scoped permissions, and documented threat boundaries.',
    icon: BookMarked,
  },
  {
    title: 'Optimize a data-heavy dashboard',
    badge: 'Performance',
    description:
      'Use indexing and caching to speed up slow queries, then present the findings as an engineering case study.',
    icon: Database,
  },
]
