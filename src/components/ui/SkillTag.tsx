import type { AccentTone } from '@/types'

import { StatusBadge } from '@/components/ui/StatusBadge'

interface SkillTagProps {
  label: string
  value?: string
  tone?: AccentTone
}

export function SkillTag({
  label,
  value,
  tone = 'violet',
}: SkillTagProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <span className="text-sm font-medium text-white">{label}</span>
      {value ? <StatusBadge label={value} tone={tone} /> : null}
    </div>
  )
}
