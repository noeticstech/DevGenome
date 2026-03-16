import { BriefcaseBusiness, ShieldCheck, Sparkles, Target, Workflow } from 'lucide-react'

import type { RoleFit, SkillDatum } from '@/types'

export const genomeScore = {
  value: 74,
  delta: '+6 this cycle',
  label: 'Optimized',
}

export const genomeStrands: SkillDatum[] = [
  { label: 'System Design', value: 91, detail: 'Macro-level architecture clarity' },
  { label: 'API Design', value: 86, detail: 'Composable backend contracts' },
  { label: 'Delivery Velocity', value: 81, detail: 'Steady release throughput' },
  { label: 'Reliability', value: 77, detail: 'Operational resilience signals' },
  { label: 'Data Modeling', value: 73, detail: 'Schema intuition and tradeoffs' },
  { label: 'Mentorship', value: 69, detail: 'Pattern-sharing and review quality' },
  { label: 'Frontend Systems', value: 65, detail: 'UI structure and polish' },
  { label: 'DevOps Fluency', value: 61, detail: 'Deployment and observability depth' },
]

export const genomePersonality = {
  title: 'The Builder',
  subtitle: 'Core archetype',
  summary:
    'You translate ambiguity into systems with unusually high structural clarity. Your profile is strongest when requirements are complex, cross-functional, and long-lived.',
  traits: [
    { label: 'Primary trait', value: 'Structural integrity' },
    { label: 'Decision style', value: 'Systems-first' },
    { label: 'Collaboration mode', value: 'Calm orchestrator' },
  ],
}

export const genomeBreakdown = [
  { label: 'Complexity handling', value: 88, accent: 'orange' as const },
  { label: 'Maintenance score', value: 72, accent: 'blue' as const },
  { label: 'Security awareness', value: 64, accent: 'violet' as const },
  { label: 'Ownership depth', value: 79, accent: 'cyan' as const },
]

export const genomeRoleFits: RoleFit[] = [
  {
    title: 'Platform-minded full stack engineer',
    alignment: '94% alignment',
    description:
      'Your genome is strongest in teams that need backend depth, architecture leadership, and reliable execution.',
    highlight: 'Best when product and infrastructure meet',
    accent: 'violet',
  },
  {
    title: 'Developer experience engineer',
    alignment: '81% alignment',
    description:
      'You score highly on systems abstraction, tooling empathy, and making complexity feel operationally simple.',
    highlight: 'Strong fit for internal platforms and tooling',
    accent: 'cyan',
  },
  {
    title: 'Technical lead',
    alignment: '76% alignment',
    description:
      'Mentorship and decision quality signals are rising, suggesting a strong next step into technical leadership.',
    highlight: 'Needs more visible mentoring loops',
    accent: 'blue',
  },
]

export const genomeSignalCards = [
  {
    title: 'Career fit summary',
    description: 'Best matched to roles where architecture, delivery, and cross-team clarity all matter.',
    icon: BriefcaseBusiness,
  },
  {
    title: 'Resilience signal',
    description: 'Reliability patterns indicate strong ownership of edge cases and long-lived systems.',
    icon: ShieldCheck,
  },
  {
    title: 'Growth vector',
    description: 'The fastest improvements now come from advanced API security and production operations.',
    icon: Target,
  },
  {
    title: 'Execution style',
    description: 'You work best when turning undefined goals into practical, staged systems.',
    icon: Workflow,
  },
  {
    title: 'Genome confidence',
    description: 'Recent repository density and consistency make this profile highly stable.',
    icon: Sparkles,
  },
]
