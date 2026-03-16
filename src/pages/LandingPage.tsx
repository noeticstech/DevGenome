import { ArrowRight, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

import { HeroGenomePreview } from '@/components/devgenome/HeroGenomePreview'
import { SequenceVisualization } from '@/components/devgenome/SequenceVisualization'
import { StatusBadge } from '@/components/ui/StatusBadge'
import {
  landingFeatures,
  landingFooterLinks,
  landingHowItWorks,
  landingPreviewGenome,
  landingSecurityPoints,
  landingSequenceSignals,
} from '@/data/landing'

const primaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-full bg-violet px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(119,58,214,0.4)] transition hover:bg-violet-soft'

const secondaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.06]'

export function LandingPage() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-5 pb-20 pt-16 sm:px-6 lg:px-8 lg:pb-28 lg:pt-24">
        <div className="mx-auto max-w-4xl text-center">
          <span className="eyebrow">AI-powered developer analytics</span>
          <h1 className="mt-8 font-display text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Decode Your
            <br />
            <span className="text-gradient">Developer DNA</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-ink-muted sm:text-xl">
            Analyze your coding activity across GitHub and discover the strengths,
            growth patterns, and role-fit signals hidden inside your engineering work.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link className={primaryButtonClass} to="/login">
              Start Genome Analysis
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link className={secondaryButtonClass} to="/dashboard">
              Explore Dashboard Preview
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <StatusBadge label="Metadata-only analysis" tone="cyan" />
            <StatusBadge label="Source code storage disabled" tone="violet" />
            <StatusBadge label="Built for developers" tone="blue" />
          </div>
        </div>
        <div className="mt-16 lg:mt-20">
          <HeroGenomePreview strands={landingPreviewGenome} />
        </div>
      </section>

      <section
        className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8"
        id="how-it-works"
      >
        <div className="max-w-2xl">
          <span className="eyebrow">How DevGenome works</span>
          <h2 className="mt-6 font-display text-4xl font-bold text-white">
            From repository metadata to a career-shaping signal system
          </h2>
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {landingHowItWorks.map((step) => {
            const Icon = step.icon

            return (
              <article key={step.title} className="surface-panel p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05]">
                  <Icon className="h-5 w-5 text-cyan" />
                </div>
                <h3 className="mt-6 font-display text-2xl font-bold text-white">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-ink-muted">
                  {step.description}
                </p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8" id="product">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="eyebrow">Product signals</span>
            <h2 className="mt-6 font-display text-4xl font-bold text-white">
              A premium interface for reading engineering strengths
            </h2>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-ink-muted">
            <ShieldCheck className="h-4 w-4 text-cyan" />
            Built around secure, metadata-only sequencing
          </div>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {landingFeatures.map((feature) => {
            const Icon = feature.icon

            return (
              <article key={feature.title} className="surface-panel p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05]">
                  <Icon className="h-5 w-5 text-violet-soft" />
                </div>
                <h3 className="mt-5 font-display text-xl font-bold text-white">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-ink-muted">
                  {feature.description}
                </p>
              </article>
            )
          })}
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {landingSecurityPoints.map((point) => {
            const Icon = point.icon

            return (
              <article key={point.title} className="surface-panel p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.05]">
                    <Icon className="h-5 w-5 text-cyan" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-white">
                      {point.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-ink-muted">
                      {point.description}
                    </p>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section
        className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8"
        id="visualizing-the-sequence"
      >
        <div className="max-w-3xl">
          <span className="eyebrow">Visualizing the sequence</span>
          <h2 className="mt-6 font-display text-4xl font-bold text-white">
            A clearer map of how raw coding activity becomes a Developer Genome
          </h2>
          <p className="mt-4 text-lg leading-8 text-ink-muted">
            This sequence view replaces the weak abstract placeholder with something
            directly tied to the product: repository metadata flowing into genome
            strands, growth momentum, and role-fit projection.
          </p>
        </div>
        <div className="mt-10">
          <SequenceVisualization signals={landingSequenceSignals} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8" id="cta">
        <div className="surface-panel-strong overflow-hidden p-8 sm:p-10 lg:p-12">
          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
            <div>
              <span className="eyebrow">Start your sequence</span>
              <h2 className="mt-6 font-display text-4xl font-bold text-white sm:text-5xl">
                Discover your Developer Genome today
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-ink-muted">
                Connect GitHub, sequence your engineering signals, and get a premium
                role-ready profile in minutes.
              </p>
            </div>
            <div className="space-y-4">
              <Link className={primaryButtonClass} to="/login">
                Start free analysis
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link className={secondaryButtonClass} to="/dashboard">
                View the SaaS preview
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 text-sm text-ink-soft sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p className="font-semibold text-white">DevGenome</p>
          <div className="flex flex-wrap gap-4">
            {landingFooterLinks.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <p>© 2026 DevGenome. All rights reserved.</p>
        </div>
      </footer>
    </>
  )
}
