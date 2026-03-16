import { ArrowRight } from 'lucide-react'

import { StatusBadge } from '@/components/ui/StatusBadge'
import type { SequenceSignal } from '@/types'

interface SequenceVisualizationProps {
  signals: SequenceSignal[]
}

export function SequenceVisualization({
  signals,
}: SequenceVisualizationProps) {
  return (
    <div className="surface-panel-strong relative overflow-hidden p-6 sm:p-8">
      <div className="absolute inset-0 subtle-grid opacity-25" />
      <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          {signals.map((signal, index) => (
            <div
              key={signal.label}
              className="flex gap-4 rounded-3xl border border-white/8 bg-white/[0.03] p-4"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/[0.05] text-sm font-bold text-white">
                0{index + 1}
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-display text-lg font-bold text-white">
                    {signal.label}
                  </h3>
                  <StatusBadge label={signal.value} tone={signal.accent} />
                </div>
                <p className="text-sm leading-6 text-ink-muted">
                  {signal.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="relative min-h-[360px] overflow-hidden rounded-[32px] border border-white/8 bg-canvas-soft">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.25),_transparent_42%),radial-gradient(circle_at_bottom,_rgba(34,211,238,0.16),_transparent_38%)]" />
          <svg
            className="absolute inset-0 h-full w-full"
            fill="none"
            viewBox="0 0 360 360"
          >
            <defs>
              <linearGradient id="sequencePath" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
            </defs>
            <path
              d="M70 300C110 240 110 120 180 90C250 60 250 210 290 150"
              stroke="url(#sequencePath)"
              strokeLinecap="round"
              strokeWidth="7"
            />
            <path
              d="M70 120C110 180 110 280 180 300C250 320 250 170 290 210"
              stroke="url(#sequencePath)"
              strokeLinecap="round"
              strokeOpacity="0.5"
              strokeWidth="7"
            />
            {[80, 126, 172, 218, 264].map((y, index) => (
              <line
                key={y}
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="3"
                x1={110 + (index % 2 === 0 ? -18 : 18)}
                x2={250 + (index % 2 === 0 ? 18 : -18)}
                y1={y}
                y2={y}
              />
            ))}
          </svg>
          <div className="absolute inset-x-5 top-5">
            <StatusBadge label="Sequence in motion" tone="cyan" />
          </div>
          <div className="absolute inset-x-5 bottom-5 space-y-4 rounded-3xl border border-white/8 bg-black/20 p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-ink-soft">
                  Genome projection
                </p>
                <p className="mt-2 font-display text-2xl font-bold text-white">
                  Metadata becomes meaning
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-cyan" />
            </div>
            <p className="text-sm leading-6 text-ink-muted">
              Instead of a vague abstract graphic, the sequence view now shows how raw
              activity signals resolve into a structured Developer Genome.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
