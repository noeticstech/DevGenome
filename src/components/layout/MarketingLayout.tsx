import { Outlet } from 'react-router-dom'

import { MarketingNavbar } from '@/components/layout/MarketingNavbar'

export function MarketingLayout() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-hero-grid">
      <MarketingNavbar />
      <div className="relative z-10">
        <Outlet />
      </div>
    </div>
  )
}
