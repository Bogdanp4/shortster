import type { ReactNode } from "react"
import { ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function PageHeader({
  title,
  description,
  actions,
  children,
  backLabel,
  onBack,
  className,
}: {
  title: string
  description?: string
  actions?: ReactNode
  children?: ReactNode
  backLabel?: string
  onBack?: () => void
  className?: string
}) {
  const trailing = actions ?? children

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {onBack && (
        <Button variant="ghost" size="sm" className="-ml-2 w-fit text-muted-foreground" onClick={onBack}>
          <ArrowLeft data-icon="inline-start" />
          {backLabel ?? "Back"}
        </Button>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-semibold tracking-tight text-balance lg:text-3xl">{title}</h1>
          {description && <p className="max-w-2xl text-sm text-muted-foreground text-pretty">{description}</p>}
        </div>
        {trailing && <div className="flex flex-wrap items-center gap-2">{trailing}</div>}
      </div>
    </div>
  )
}
