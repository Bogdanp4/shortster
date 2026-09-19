import { cn } from "@/lib/utils"

export function Logo({ className, showWordmark = true }: { className?: string; showWordmark?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="relative flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[0_0_20px_-4px_var(--primary)]">
        <svg viewBox="0 0 24 24" className="size-4.5" fill="none" aria-hidden>
          <path d="M9 6L16 12L9 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {showWordmark && (
        <span className="text-base font-semibold tracking-tight">
          Shortster
        </span>
      )}
    </div>
  )
}
