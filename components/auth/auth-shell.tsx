import type { ReactNode } from "react"
import { Logo } from "@/components/app/logo"
import { cn } from "@/lib/utils"

export function AuthShell({
  children,
  title,
  description,
  className,
}: {
  children: ReactNode
  title: string
  description?: string
  className?: string
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10">
      <div className={cn("flex w-full max-w-sm flex-col gap-6", className)}>
        <div className="flex justify-center">
          <Logo />
        </div>
        <div className="rounded-xl border border-border/60 bg-card/40 p-6 shadow-sm sm:p-7">
          <div className="mb-6 flex flex-col gap-1.5 text-center">
            <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
