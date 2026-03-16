import { Outlet, useLocation } from 'react-router-dom'

import { AppSidebar } from '@/components/layout/AppSidebar'
import { AppTopbar } from '@/components/layout/AppTopbar'
import { MarketingNavbar } from '@/components/layout/MarketingNavbar'
import { routeMeta } from '@/data/app'

interface AppLayoutProps {
  compact?: boolean
}

const fallbackMeta = {
  title: 'DevGenome',
  description: 'Developer intelligence workspace',
  searchPlaceholder: 'Search...',
}

export function AppLayout({ compact = false }: AppLayoutProps) {
  const location = useLocation()
  const meta = routeMeta[location.pathname] ?? fallbackMeta

  if (compact) {
    return (
      <div className="min-h-screen bg-hero-grid">
        <MarketingNavbar compact />
        <main className="relative z-10">
          <Outlet />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-canvas">
      <div className="flex min-h-screen">
        <AppSidebar />
        <div className="min-w-0 flex-1">
          <AppTopbar meta={meta} />
          <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
