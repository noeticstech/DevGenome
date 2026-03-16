import { Github, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react'

export const loginPlatforms = [
  {
    name: 'GitHub',
    description: 'Connect repositories, commits, and language usage from your public profile.',
    status: 'available',
    icon: Github,
  },
  {
    name: 'LeetCode',
    description: 'Coming soon',
    status: 'coming-soon',
    icon: Sparkles,
  },
  {
    name: 'Codeforces',
    description: 'Coming soon',
    status: 'coming-soon',
    icon: Sparkles,
  },
]

export const loginSecurityHighlights = [
  {
    title: 'Data safety',
    description: 'Public metadata only',
    icon: ShieldCheck,
  },
  {
    title: 'OAuth 2.0',
    description: 'Revoke access anytime',
    icon: LockKeyhole,
  },
  {
    title: 'Encrypted',
    description: 'End-to-end secure transport',
    icon: Sparkles,
  },
]
