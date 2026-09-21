"use client"

import { useApp } from "./app-provider"
import { Logo } from "./logo"
import { SidebarNav } from "./sidebar-nav"
import { RoleSwitcher } from "./role-switcher"
import { TopHeader } from "./top-header"
import { ViewRouter } from "./view-router"
import { useT } from "@/components/i18n/locale-provider"
import { roleLabels } from "@/lib/nav"
import { DEMO_ROLE_OVERRIDE_ENABLED } from "@/lib/dev-config"

export function DashboardShell() {
  const { role } = useApp()
  const t = useT()

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-border/60 bg-card/40 lg:flex">
        <div className="flex h-16 items-center border-b border-border/60 px-5">
          <Logo />
        </div>
        {DEMO_ROLE_OVERRIDE_ENABLED && (
          <div className="px-3 py-4">
            <RoleSwitcher />
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-3 pb-4">
          <SidebarNav />
        </div>
        <div className="border-t border-border/60 p-4">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs font-medium">{roleLabels[role]} workspace</p>
            <p className="mt-1 text-xs text-muted-foreground">{t("shell.prototypeNote")}</p>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <TopHeader />
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-7xl">
            <ViewRouter />
          </div>
        </main>
      </div>
    </div>
  )
}
