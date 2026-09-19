"use client"

import { useApp } from "./app-provider"
import { navConfig } from "@/lib/nav"
import { cn } from "@/lib/utils"

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { role, view, navigate } = useApp()
  const items = navConfig[role]

  // The active nav key may differ from the view for detail pages.
  const activeKey = resolveActiveKey(role, view)

  return (
    <nav className="flex flex-col gap-1" aria-label="Primary">
      {items.map((item) => {
        const Icon = item.icon
        const active = item.key === activeKey
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => {
              navigate(item.key)
              onNavigate?.()
            }}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary/12 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className={cn("size-4.5 transition-colors", active ? "text-primary" : "")} />
            <span className="truncate">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

const detailToNav: Record<string, string> = {
  campaign: "discover",
  submit: "discover",
  submission: "submissions",
  "adv-campaign": "campaigns",
  "adv-submission": "adv-submissions",
  review: "queue",
}

function resolveActiveKey(_role: string, view: string) {
  return detailToNav[view] ?? view
}
