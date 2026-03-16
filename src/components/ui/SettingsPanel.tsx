import type { ReactNode } from 'react'

import { SectionCard } from '@/components/ui/SectionCard'

interface SettingsPanelProps {
  title: string
  subtitle?: string
  children: ReactNode
  action?: ReactNode
  className?: string
}

export function SettingsPanel({
  title,
  subtitle,
  children,
  action,
  className,
}: SettingsPanelProps) {
  return (
    <SectionCard title={title} subtitle={subtitle} action={action} className={className}>
      {children}
    </SectionCard>
  )
}
