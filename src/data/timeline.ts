import { ArrowUpRight, Blocks, Container, Database, Rocket, Sparkles } from 'lucide-react'

import type { TimelineMilestone } from '@/types'

export const timelineStoryCards = [
  {
    title: 'Tracked period',
    value: '4.2 years',
    description: 'Contribution history sequenced from public repository metadata.',
    icon: Sparkles,
  },
  {
    title: 'Milestones',
    value: '18 total',
    description: 'Major growth pivots detected from your activity and stack shifts.',
    icon: ArrowUpRight,
  },
  {
    title: 'Core tools',
    value: '9',
    description: 'Technologies with enduring signal across your timeline.',
    icon: Blocks,
  },
]

export const timelineMilestones: TimelineMilestone[] = [
  {
    year: '2021',
    phase: 'Foundation phase',
    title: 'Shipped the first production frontend systems',
    description:
      'Your early signal shows rapid movement from UI implementation into reusable component architecture and API wiring.',
    stack: ['React', 'TypeScript', 'REST'],
    impact: 'Created the base layer for product-facing engineering work.',
    direction: 'left',
    accent: 'violet',
  },
  {
    year: '2022',
    phase: 'Backend expansion',
    title: 'Moved into API design and service ownership',
    description:
      'Repository signals show backend ownership increasing, especially around schema design and service composition.',
    stack: ['Node.js', 'Postgres', 'Express'],
    impact: 'Shifted from feature execution into system responsibility.',
    direction: 'right',
    accent: 'blue',
  },
  {
    year: '2023',
    phase: 'Platform maturity',
    title: 'Adopted containerized workflows and CI polish',
    description:
      'Infrastructure fluency accelerated as deployment scripts, local orchestration, and observability patterns appeared more often.',
    stack: ['Docker', 'CI/CD', 'Monitoring'],
    impact: 'Broadened scope from code authoring into delivery systems.',
    direction: 'left',
    accent: 'cyan',
  },
  {
    year: '2024',
    phase: 'Systems thinking',
    title: 'Became the architecture stabilizer on complex work',
    description:
      'Long-lived projects show more refactoring, design tradeoff decisions, and cross-cutting reliability changes.',
    stack: ['System Design', 'Architecture Reviews', 'Reliability'],
    impact: 'Your genome begins to tilt strongly toward builder archetype patterns.',
    direction: 'right',
    accent: 'violet',
  },
  {
    year: '2025',
    phase: 'Active evolution',
    title: 'Expanded into platform-minded full stack work',
    description:
      'Signals now combine frontend leadership with backend ownership and stronger infrastructure literacy across multiple repos.',
    stack: ['Next.js', 'API Security', 'Platform Thinking'],
    impact: 'The timeline now reads like a transition into platform-heavy product engineering.',
    direction: 'left',
    accent: 'blue',
  },
  {
    year: '2026',
    phase: 'Upward trajectory',
    title: 'Emerging full stack platform lead',
    description:
      'Recent momentum suggests the next phase is technical leadership with deeper production ownership and mentoring loops.',
    stack: ['Mentorship', 'Production Systems', 'Technical Strategy'],
    impact: 'Strongest future signal points toward architecture-led leadership.',
    direction: 'right',
    accent: 'cyan',
  },
]

export const timelineAdoptionJourney = [
  {
    title: 'Frontend to platform',
    description: 'The timeline steadily moves from interface implementation into systems orchestration.',
    icon: Rocket,
  },
  {
    title: 'Data-aware engineering',
    description: 'Schema decisions and query awareness become more visible year after year.',
    icon: Database,
  },
  {
    title: 'Container confidence',
    description: 'Tooling history suggests a clear move toward distributed systems and operational thinking.',
    icon: Container,
  },
]
