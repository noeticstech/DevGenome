import { CheckCircle2, LoaderCircle } from 'lucide-react'

import { cn } from '@/lib/cn'

interface LoadingStep {
  label: string
  done?: boolean
  active?: boolean
}

interface LoadingStateProps {
  title: string
  description: string
  progress: number
  steps: LoadingStep[]
}

export function LoadingState({
  title,
  description,
  progress,
  steps,
}: LoadingStateProps) {
  return (
    <div className="space-y-6 rounded-3xl border border-white/8 bg-white/[0.03] p-5">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-sm leading-6 text-ink-muted">{description}</p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet via-violet-soft to-cyan transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="space-y-3">
        {steps.map((step) => (
          <div
            key={step.label}
            className={cn(
              'flex items-center gap-3 text-sm',
              step.done ? 'text-white' : 'text-ink-soft',
            )}
          >
            {step.done ? (
              <CheckCircle2 className="h-4 w-4 text-cyan" />
            ) : (
              <LoaderCircle
                className={cn(
                  'h-4 w-4',
                  step.active ? 'animate-spin text-violet-soft' : 'text-ink-soft/60',
                )}
              />
            )}
            <span>{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
