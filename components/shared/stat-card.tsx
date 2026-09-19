import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  trend,
  accent = "default",
}: {
  label: string
  value: string
  icon?: LucideIcon
  hint?: string
  trend?: { value: string; positive: boolean }
  accent?: "default" | "success" | "warning" | "danger" | "brand"
}) {
  const accentClass = {
    default: "text-foreground",
    success: "text-success",
    warning: "text-warning",
    danger: "text-destructive",
    brand: "text-primary",
  }[accent]

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          {Icon && (
            <span className="flex size-8 items-center justify-center rounded-lg bg-muted">
              <Icon className="size-4 text-muted-foreground" />
            </span>
          )}
        </div>
        <div className="flex items-end gap-2">
          <span className={cn("text-2xl font-semibold tracking-tight tabular-nums lg:text-3xl", accentClass)}>
            {value}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {trend && (
            <span className={cn("font-medium", trend.positive ? "text-success" : "text-destructive")}>
              {trend.value}
            </span>
          )}
          {hint && <span className="text-muted-foreground">{hint}</span>}
        </div>
      </CardContent>
    </Card>
  )
}
