import type { ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface ErrorStateProps {
  title: string
  description: string
  action?: ReactNode
}

export function ErrorState({ title, description, action }: ErrorStateProps) {
  return (
    <div className="surface-muted flex flex-col items-center justify-center gap-4 px-8 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red/10">
        <AlertTriangle className="h-6 w-6 text-red" />
      </div>
      <div className="space-y-2">
        <h3 className="font-display text-xl font-bold text-white">{title}</h3>
        <p className="max-w-md text-sm leading-6 text-ink-muted">{description}</p>
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  )
}
