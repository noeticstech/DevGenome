import {
  Binary,
  BriefcaseBusiness,
  ChartSpline,
  GitBranch,
  Layers3,
  ShieldCheck,
  Sparkles,
  Waypoints,
} from 'lucide-react'

import type { SequenceSignal, SkillDatum } from '@/types'

export const landingHowItWorks = [
  {
    title: 'Connect your activity footprint',
    description:
      'Import GitHub metadata, repository patterns, language mix, and collaboration velocity in a single pass.',
    icon: GitBranch,
  },
  {
    title: 'Sequence engineering signals',
    description:
      'DevGenome converts commits, architecture depth, and learning behavior into weighted competency strands.',
    icon: Binary,
  },
  {
    title: 'Reveal your developer profile',
    description:
      'See your strongest traits, role-fit alignment, and the next moves that compound your growth fastest.',
    icon: Sparkles,
  },
]

export const landingFeatures = [
  {
    title: 'Genome profile',
    description: 'A premium DNA-style profile of how you build, debug, scale, and learn.',
    icon: Layers3,
  },
  {
    title: 'Skill radar',
    description: 'Compare current depth against benchmarks and future role requirements.',
    icon: ChartSpline,
  },
  {
    title: 'Learning velocity',
    description: 'Track how quickly new tools move from experimentation into daily production.',
    icon: Waypoints,
  },
  {
    title: 'Career fit',
    description: 'Translate your engineering signature into concrete role and team fit guidance.',
    icon: BriefcaseBusiness,
  },
]

export const landingPreviewGenome: SkillDatum[] = [
  { label: 'System Design', value: 92, detail: 'Architecture' },
  { label: 'Execution Velocity', value: 87, detail: 'Delivery' },
  { label: 'API Design', value: 84, detail: 'Backend' },
  { label: 'Mentorship', value: 71, detail: 'Leadership' },
  { label: 'Infra Fluency', value: 68, detail: 'Scale' },
]

export const landingSequenceSignals: SequenceSignal[] = [
  {
    label: 'Repository metadata',
    value: '26 repos',
    description: 'Commit cadence, ownership, and architecture density are sequenced together.',
    accent: 'blue',
  },
  {
    label: 'Skill signatures',
    value: '18 strands',
    description: 'Languages, systems thinking, reliability, and collaboration become measurable signals.',
    accent: 'violet',
  },
  {
    label: 'Growth momentum',
    value: '+14%',
    description: 'Learning velocity shows which capabilities are accelerating right now.',
    accent: 'cyan',
  },
  {
    label: 'Role fit mapping',
    value: '3 strong fits',
    description: 'Your genome is projected into likely roles, team shapes, and next evolution paths.',
    accent: 'green',
  },
]

export const landingSecurityPoints = [
  {
    title: 'Metadata-only analysis',
    description: 'DevGenome analyzes contribution metadata and public repository signals, not your source files.',
    icon: ShieldCheck,
  },
  {
    title: 'OAuth-first connection',
    description: 'Link GitHub securely, then revoke access any time from account settings.',
    icon: Sparkles,
  },
]

export const landingFooterLinks = [
  'Product',
  'Docs',
  'GitHub',
  'Privacy',
  'Terms',
]
