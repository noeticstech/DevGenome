import type { ReactNode } from 'react'

import { SectionCard } from '@/components/ui/SectionCard'

interface ChartCardProps {
  title: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}

export function ChartCard({
  title,
  subtitle,
  action,
  children,
  className,
}: ChartCardProps) {
  return (
    <SectionCard
      title={title}
      subtitle={subtitle}
      action={action}
      className={className}
      contentClassName="px-5 py-5 sm:px-6"
    >
      {children}
    </SectionCard>
  )
}
