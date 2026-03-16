import {
  ChartColumnIncreasing,
  Dna,
  LayoutDashboard,
  Settings,
  Target,
  TrendingUp,
} from 'lucide-react'

import type { NavItem, RouteMeta } from '@/types'

export const appNavigation: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    description: 'Genome overview and signal trends',
  },
  {
    label: 'Genome',
    path: '/genome',
    icon: Dna,
    description: 'Your signature developer DNA profile',
  },
  {
    label: 'Activity',
    path: '/activity',
    icon: ChartColumnIncreasing,
    description: 'Contribution patterns and coding rhythm',
  },
  {
    label: 'Skills',
    path: '/skills',
    icon: Target,
    description: 'Gap detection and growth plan',
    badge: 'Actionable',
  },
  {
    label: 'Timeline',
    path: '/timeline',
    icon: TrendingUp,
    description: 'Narrative view of your evolution',
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: Settings,
    description: 'Profile, privacy, and preferences',
  },
]

export const marketingLinks = [
  { label: 'Product', href: '#product' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Genome', href: '#visualizing-the-sequence' },
  { label: 'FAQ', href: '#cta' },
]

export const routeMeta: Record<string, RouteMeta> = {
  '/login': {
    title: 'Connect your developer accounts',
    description: 'Securely link your public coding platforms to generate your Developer Genome.',
    searchPlaceholder: 'Search product docs or case studies...',
  },
  '/dashboard': {
    title: 'Genome command center',
    description: 'A high-signal summary of how your engineering strengths are shifting this cycle.',
    searchPlaceholder: 'Search repositories or technologies...',
  },
  '/genome': {
    title: 'Your Developer Genome',
    description: 'A multi-dimensional DNA map of how you solve problems, learn, and ship software.',
    searchPlaceholder: 'Search genome strands or strengths...',
  },
  '/activity': {
    title: 'Activity intelligence',
    description: 'Contribution density, language mix, and repository impact across your recent work.',
    searchPlaceholder: 'Search repositories or activity trends...',
  },
  '/skills': {
    title: 'Skill gap detection',
    description: 'Compare current depth against your target role and plan the fastest upgrade path.',
    searchPlaceholder: 'Search skills, technologies, or roles...',
  },
  '/timeline': {
    title: 'Developer evolution timeline',
    description: 'See your growth milestones, stack pivots, and the next phase of your engineering arc.',
    searchPlaceholder: 'Search genome milestones...',
  },
  '/settings': {
    title: 'Settings',
    description: 'Manage connected accounts, preferences, alerts, and privacy controls.',
    searchPlaceholder: 'Search settings or preferences...',
  },
}
