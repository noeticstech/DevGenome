import { ArrowRight, Github, ShieldCheck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { LoadingState } from '@/components/ui/LoadingState'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { loginPlatforms, loginSecurityHighlights } from '@/data/login'

const stages = [
  'Initializing DNA scan',
  'Connecting to GitHub',
  'Analyzing repository metadata',
  'Generating developer genome',
]

export function LoginPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [stageIndex, setStageIndex] = useState(0)
  const [complete, setComplete] = useState(false)

  useEffect(() => {
    if (!isAnalyzing || complete) {
      return
    }

    if (stageIndex === stages.length - 1) {
      const finishTimer = window.setTimeout(() => setComplete(true), 900)
      return () => window.clearTimeout(finishTimer)
    }

    const timer = window.setTimeout(() => {
      setStageIndex((current) => current + 1)
    }, 1100)

    return () => window.clearTimeout(timer)
  }, [complete, isAnalyzing, stageIndex])

  const progress = useMemo(() => {
    if (complete) {
      return 100
    }

    return [18, 42, 68, 88][stageIndex] ?? 0
  }, [complete, stageIndex])

  const loadingSteps = stages.map((label, index) => ({
    label,
    done: complete || index < stageIndex,
    active: isAnalyzing && !complete && index === stageIndex,
  }))

  const handleAnalyze = () => {
    setIsAnalyzing(true)
    setComplete(false)
    setStageIndex(0)
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,520px)_1fr] lg:items-center">
        <div className="surface-panel-strong mx-auto w-full max-w-[520px] p-7 sm:p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[28px] bg-gradient-to-br from-violet to-cyan shadow-[0_16px_40px_rgba(119,58,214,0.4)]">
            <Github className="h-7 w-7 text-white" />
          </div>
          <div className="mt-8 text-center">
            <h1 className="font-display text-4xl font-bold text-white">
              Connect Your Developer Accounts
            </h1>
            <p className="mt-4 text-base leading-7 text-ink-muted">
              Link your coding platforms to generate a unique Developer Genome profile.
            </p>
          </div>

          <button
            className="mt-8 flex w-full items-center justify-between rounded-2xl bg-white px-5 py-4 text-left text-canvas transition hover:bg-white/95 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isAnalyzing && !complete}
            onClick={handleAnalyze}
            type="button"
          >
            <span className="flex items-center gap-3 text-sm font-semibold">
              <Github className="h-5 w-5" />
              Connect GitHub
            </span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <p className="mt-4 text-sm leading-6 text-ink-soft">
            Analyze repositories, commit patterns, and language usage across your public
            profile.
          </p>

          <div className="mt-6 space-y-3">
            {loginPlatforms
              .filter((platform) => platform.status === 'coming-soon')
              .map((platform) => {
                const Icon = platform.icon

                return (
                  <div
                    key={platform.name}
                    className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4 text-ink-soft"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.04]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="font-medium">{platform.name}</span>
                    </div>
                    <StatusBadge label="Soon" tone="violet" />
                  </div>
                )
              })}
          </div>

          <div className="mt-8">
            <LoadingState
              description={
                complete
                  ? 'Genome sequencing complete. Your interactive product preview is ready.'
                  : 'A polished UI-only progress state to simulate the analysis flow without any backend integration.'
              }
              progress={progress}
              steps={loadingSteps}
              title={complete ? 'Developer genome ready' : 'Analysis progress'}
            />
          </div>

          <div className="mt-6 rounded-3xl border border-cyan/20 bg-cyan/10 p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-cyan" />
              <div className="space-y-2">
                <p className="font-semibold text-white">Security by design</p>
                <p className="text-sm leading-6 text-ink-muted">
                  DevGenome securely reads public repository metadata using OAuth.
                  Your source code is never stored on our servers.
                </p>
              </div>
            </div>
          </div>

          {complete ? (
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex items-center justify-center gap-2 rounded-full bg-violet px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-soft"
                to="/dashboard"
              >
                Open dashboard preview
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.06]"
                to="/genome"
              >
                Jump to genome page
              </Link>
            </div>
          ) : null}
        </div>

        <div className="space-y-8">
          <div>
            <span className="eyebrow">Connect once, explore everywhere</span>
            <h2 className="mt-6 font-display text-4xl font-bold text-white sm:text-5xl">
              A focused connection flow that still feels like the product
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-ink-muted">
              This login screen keeps a clean entry experience while preserving the same
              dark DevGenome visual system used across the SaaS workspace.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {loginSecurityHighlights.map((item) => {
              const Icon = item.icon

              return (
                <article key={item.title} className="surface-panel p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05]">
                    <Icon className="h-5 w-5 text-cyan" />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-bold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-ink-muted">{item.description}</p>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
