"use client"

import { AuthShell } from "./auth-shell"
import { useAuth } from "./auth-provider"
import type { PublicRole } from "@/lib/types"
import { Sparkles, Megaphone, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const options: {
  role: PublicRole
  title: string
  description: string
  icon: typeof Sparkles
}[] = [
  {
    role: "creator",
    title: "I'm a Creator",
    description: "Post short-form content and get paid for verified views.",
    icon: Sparkles,
  },
  {
    role: "advertiser",
    title: "I'm an Advertiser",
    description: "Launch campaigns and pay for verified distribution.",
    icon: Megaphone,
  },
]

export function RoleSelectionView() {
  const { selectRole, currentUser } = useAuth()

  return (
    <AuthShell
      title={`Welcome, ${currentUser?.name ?? "there"}`}
      description="How do you want to use Shortster?"
      className="max-w-md"
    >
      <div className="flex flex-col gap-3">
        {options.map((opt) => (
          <button
            key={opt.role}
            type="button"
            onClick={() => selectRole(opt.role)}
            className={cn(
              "group flex items-center gap-4 rounded-lg border border-border/60 p-4 text-left transition-colors hover:border-primary/50 hover:bg-primary/5",
            )}
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/12 text-primary">
              <opt.icon className="size-5" />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-medium">{opt.title}</span>
              <span className="block text-xs text-muted-foreground">{opt.description}</span>
            </span>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </button>
        ))}
      </div>
      <p className="mt-5 text-center text-xs text-muted-foreground">
        You can add the other role from your profile menu later.
      </p>
    </AuthShell>
  )
}
