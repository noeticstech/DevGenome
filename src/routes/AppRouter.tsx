import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { AppLayout } from '@/components/layout/AppLayout'
import { MarketingLayout } from '@/components/layout/MarketingLayout'

const LandingPage = lazy(async () => ({
  default: (await import('@/pages/LandingPage')).LandingPage,
}))
const LoginPage = lazy(async () => ({
  default: (await import('@/pages/LoginPage')).LoginPage,
}))
const DashboardPage = lazy(async () => ({
  default: (await import('@/pages/DashboardPage')).DashboardPage,
}))
const GenomePage = lazy(async () => ({
  default: (await import('@/pages/GenomePage')).GenomePage,
}))
const ActivityPage = lazy(async () => ({
  default: (await import('@/pages/ActivityPage')).ActivityPage,
}))
const SkillsPage = lazy(async () => ({
  default: (await import('@/pages/SkillsPage')).SkillsPage,
}))
const TimelinePage = lazy(async () => ({
  default: (await import('@/pages/TimelinePage')).TimelinePage,
}))
const SettingsPage = lazy(async () => ({
  default: (await import('@/pages/SettingsPage')).SettingsPage,
}))

function RouteFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-6">
      <div className="surface-panel flex items-center gap-3 px-5 py-4 text-sm text-ink-muted">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-cyan" />
        Loading interface
      </div>
    </div>
  )
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route element={<MarketingLayout />}>
            <Route element={<LandingPage />} path="/" />
          </Route>
          <Route element={<AppLayout compact />}>
            <Route element={<LoginPage />} path="/login" />
          </Route>
          <Route element={<AppLayout />}>
            <Route element={<DashboardPage />} path="/dashboard" />
            <Route element={<GenomePage />} path="/genome" />
            <Route element={<ActivityPage />} path="/activity" />
            <Route element={<SkillsPage />} path="/skills" />
            <Route element={<TimelinePage />} path="/timeline" />
            <Route element={<SettingsPage />} path="/settings" />
          </Route>
          <Route element={<Navigate replace to="/" />} path="*" />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
