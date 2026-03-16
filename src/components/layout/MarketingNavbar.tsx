import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Logo } from '@/components/ui/Logo'
import { marketingLinks } from '@/data/app'
import { cn } from '@/lib/cn'

interface MarketingNavbarProps {
  compact?: boolean
}

export function MarketingNavbar({ compact = false }: MarketingNavbarProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b border-white/6 bg-canvas/75 backdrop-blur-xl',
        compact ? 'bg-canvas/85' : '',
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-6 lg:px-8">
        <Logo compact={compact} />
        <nav className="hidden items-center gap-8 text-sm text-ink-muted lg:flex">
          {marketingLinks.map((link) => (
            <a
              key={link.label}
              className="transition hover:text-white"
              href={link.href}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            className="hidden rounded-full px-4 py-2 text-sm font-medium text-ink-muted transition hover:bg-white/[0.03] hover:text-white sm:inline-flex"
            to="/login"
          >
            Login
          </Link>
          <Link
            className="inline-flex items-center gap-2 rounded-full bg-violet px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(119,58,214,0.45)] transition hover:bg-violet-soft"
            to="/login"
          >
            Start Analysis
            {!compact ? <ArrowRight className="h-4 w-4" /> : null}
          </Link>
        </div>
      </div>
    </header>
  )
}
