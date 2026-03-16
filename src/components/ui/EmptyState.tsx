import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description: string
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="surface-muted flex flex-col items-center justify-center gap-4 px-8 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.05]">
        <Inbox className="h-6 w-6 text-ink-soft" />
      </div>
      <div className="space-y-2">
        <h3 className="font-display text-xl font-bold text-white">{title}</h3>
        <p className="max-w-md text-sm leading-6 text-ink-muted">{description}</p>
      </div>
    </div>
  )
}
