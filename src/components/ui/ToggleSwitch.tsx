import { cn } from '@/lib/cn'

interface ToggleSwitchProps {
  checked: boolean
}

export function ToggleSwitch({ checked }: ToggleSwitchProps) {
  return (
    <div
      className={cn(
        'flex h-7 w-12 items-center rounded-full border px-1 transition',
        checked
          ? 'border-violet/30 bg-violet/30 justify-end'
          : 'border-white/10 bg-white/[0.06] justify-start',
      )}
    >
      <span className="h-5 w-5 rounded-full bg-white shadow-md" />
    </div>
  )
}
