import { Code2, Github, Laptop, MoonStar, ShieldCheck, Trophy } from 'lucide-react'

import type {
  ConnectedAccount,
  NotificationSetting,
  ThemeOption,
} from '@/types'

export const settingsAccounts: ConnectedAccount[] = [
  {
    name: 'GitHub',
    description: 'Import repositories and public contribution metadata.',
    status: 'connected',
    detail: 'Synced 2 hours ago',
    action: 'Reconnect',
    icon: Github,
    accent: 'cyan',
  },
  {
    name: 'LeetCode',
    description: 'Track problem-solving and algorithm proficiency.',
    status: 'coming-soon',
    detail: 'Roadmap integration',
    action: 'Notify me',
    icon: Trophy,
    accent: 'violet',
  },
  {
    name: 'Codeforces',
    description: 'Competitive programming skill signal.',
    status: 'coming-soon',
    detail: 'Roadmap integration',
    action: 'Notify me',
    icon: Code2,
    accent: 'blue',
  },
]

export const settingsProfile = {
  displayName: 'Alex Rivera',
  username: 'alex.rivera.dev',
  role: 'Senior Full Stack Engineer',
  timezone: 'Asia/Kolkata',
}

export const settingsThemeOptions: ThemeOption[] = [
  {
    label: 'Dark',
    description: 'The signature DevGenome theme.',
    icon: MoonStar,
    selected: true,
  },
  {
    label: 'System',
    description: 'Follow your OS preference.',
    icon: Laptop,
    selected: false,
  },
]

export const settingsAccentPalette = ['#a855f7', '#c084fc', '#22d3ee', '#3b82f6']

export const settingsNotifications: NotificationSetting[] = [
  {
    label: 'Weekly summary',
    description: 'A compact digest of your latest genome movement and role-fit changes.',
    enabled: true,
  },
  {
    label: 'Learning progress',
    description: 'Milestone alerts when emerging skills become stable strengths.',
    enabled: false,
  },
  {
    label: 'Skill gap alerts',
    description: 'Notifications when target-role weak spots become more pronounced.',
    enabled: true,
  },
  {
    label: 'Product updates',
    description: 'Release notes for new models, integrations, and visualization upgrades.',
    enabled: true,
  },
]

export const settingsPrivacyControls = [
  {
    label: 'Source Code Storage',
    value: 'Disabled',
    description: 'DevGenome does not store your source code. Only selected metadata signals are analyzed.',
    icon: ShieldCheck,
  },
  {
    label: 'Metadata-Only Analysis',
    value: 'Enabled',
    description: 'Repository metadata, contribution timing, and technology signals power your profile.',
    icon: Code2,
  },
]
