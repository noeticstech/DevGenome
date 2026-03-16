import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { GenomeHelix } from '@/components/devgenome/GenomeHelix'
import { InfoRow } from '@/components/ui/InfoRow'
import { PageHeader } from '@/components/ui/PageHeader'
import { SectionCard } from '@/components/ui/SectionCard'
import { SkillTag } from '@/components/ui/SkillTag'
import { StatusBadge } from '@/components/ui/StatusBadge'
import {
  genomeBreakdown,
  genomePersonality,
  genomeRoleFits,
  genomeScore,
  genomeSignalCards,
  genomeStrands,
} from '@/data/genome'

const actionButtonClass =
  'inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.06]'

const breakdownToneMap = {
  orange: 'bg-orange',
  blue: 'bg-blue',
  violet: 'bg-violet',
  cyan: 'bg-cyan',
}

export function GenomePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        actions={
          <>
            <Link className={actionButtonClass} to="/skills">
              Compare target roles
            </Link>
            <Link className={actionButtonClass} to="/timeline">
              Open evolution timeline
            </Link>
          </>
        }
        badge={genomeScore.label}
        badgeTone="cyan"
        description="This is the signature DevGenome view: a premium DNA-style map of your engineering strengths, personality, and career fit."
        eyebrow="Genome profile"
        title="Your Developer Genome"
      />

      <SectionCard
        subtitle="A DNA-inspired strand view of the skills and behaviors most responsible for your current profile."
        title="Signature genome visualization"
      >
        <GenomeHelix score={genomeScore.value} strands={genomeStrands} />
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <SectionCard
          action={<StatusBadge label={genomeScore.delta} tone="violet" />}
          subtitle={genomePersonality.subtitle}
          title={genomePersonality.title}
        >
          <p className="text-sm leading-7 text-ink-muted">
            {genomePersonality.summary}
          </p>
          <div className="mt-6">
            {genomePersonality.traits.map((trait) => (
              <InfoRow key={trait.label} label={trait.label} value={trait.value} />
            ))}
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {genomeSignalCards.map((card) => {
              const Icon = card.icon

              return (
                <div
                  key={card.title}
                  className="rounded-3xl border border-white/8 bg-white/[0.03] p-4"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.05]">
                    <Icon className="h-5 w-5 text-cyan" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold text-white">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-ink-muted">
                    {card.description}
                  </p>
                </div>
              )
            })}
          </div>
        </SectionCard>

        <SectionCard
          subtitle="Detailed scoring across the traits that most influence role fit and perceived engineering quality."
          title="Skill breakdown"
        >
          <div className="space-y-5">
            {genomeBreakdown.map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-white">{item.label}</span>
                  <span className="font-semibold text-ink-muted">{item.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.06]">
                  <div
                    className={`h-full rounded-full ${breakdownToneMap[item.accent]}`}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {genomeStrands.map((strand) => (
              <SkillTag
                key={strand.label}
                label={strand.label}
                tone="violet"
                value={`${strand.value}%`}
              />
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        subtitle="The roles and team shapes that map most naturally to your current engineering DNA."
        title="Career fit summary"
      >
        <div className="grid gap-5 lg:grid-cols-3">
          {genomeRoleFits.map((fit) => (
            <article
              key={fit.title}
              className="rounded-[30px] border border-white/8 bg-white/[0.03] p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <StatusBadge label={fit.alignment} tone={fit.accent} />
                <ArrowRight className="h-4 w-4 text-cyan" />
              </div>
              <h3 className="mt-5 font-display text-2xl font-bold text-white">
                {fit.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-ink-muted">
                {fit.description}
              </p>
              <p className="mt-4 text-sm font-semibold text-white">{fit.highlight}</p>
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}
