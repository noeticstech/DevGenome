import { Dna } from 'lucide-react'
import { Link } from 'react-router-dom'

import { cn } from '@/lib/cn'

interface LogoProps {
  compact?: boolean
  className?: string
}

export function Logo({ compact = false, className }: LogoProps) {
  return (
    <Link className={cn('flex items-center gap-3', className)} to="/">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet to-cyan shadow-[0_14px_32px_rgba(84,16,156,0.45)]">
        <Dna className="h-5 w-5 text-white" />
      </div>
      <div className={compact ? 'hidden sm:block' : 'block'}>
        <p className="font-display text-xl font-bold tracking-tight text-white">
          DevGenome
        </p>
        <p className="text-xs uppercase tracking-[0.32em] text-ink-soft">
          Developer Intelligence
        </p>
      </div>
    </Link>
  )
}
