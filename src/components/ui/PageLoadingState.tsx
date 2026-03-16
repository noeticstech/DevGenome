export function PageLoadingState() {
  return (
    <div className="surface-muted flex min-h-[280px] items-center justify-center px-8 py-14">
      <div className="flex items-center gap-3 text-sm text-ink-muted">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-cyan" />
        Loading DevGenome data
      </div>
    </div>
  )
}
