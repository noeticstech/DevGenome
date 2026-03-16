import { cn } from '@/lib/cn'

interface ToggleSwitchProps {
  checked: boolean
  disabled?: boolean
  onChange?: (checked: boolean) => void
}

export function ToggleSwitch({
  checked,
  disabled = false,
  onChange,
}: ToggleSwitchProps) {
  return (
    <button
      aria-checked={checked}
      className={cn(
        'flex h-7 w-12 items-center rounded-full border px-1 transition disabled:cursor-not-allowed disabled:opacity-60',
        checked
          ? 'border-violet/30 bg-violet/30 justify-end'
          : 'border-white/10 bg-white/[0.06] justify-start',
      )}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      role="switch"
      type="button"
    >
      <span className="h-5 w-5 rounded-full bg-white shadow-md" />
    </button>
  )
}
