"use client"

import { useMemo, useState } from "react"
import { ShieldCheck, DollarSign, UserCog, Megaphone, Activity } from "lucide-react"

import { auditLogs } from "@/lib/mock-data"
import type { AuditLog } from "@/lib/types"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useT } from "@/components/i18n/locale-provider"

const categoryIcon: Record<AuditLog["category"], typeof Activity> = {
  moderation: ShieldCheck,
  financial: DollarSign,
  account: UserCog,
  campaign: Megaphone,
}

export function AdminAuditView() {
  const t = useT()
  const categoryConfig: Record<AuditLog["category"], { icon: typeof Activity; label: string }> = {
    moderation: { icon: categoryIcon.moderation, label: t("adminAudit.moderation") },
    financial: { icon: categoryIcon.financial, label: t("adminAudit.financial") },
    account: { icon: categoryIcon.account, label: t("adminAudit.account") },
    campaign: { icon: categoryIcon.campaign, label: t("adminAudit.campaign") },
  }
  const tabs: { value: AuditLog["category"] | "all"; label: string }[] = [
    { value: "all", label: t("adminAudit.all") },
    { value: "moderation", label: t("adminAudit.moderation") },
    { value: "financial", label: t("adminAudit.financial") },
    { value: "account", label: t("adminAudit.account") },
    { value: "campaign", label: t("adminAudit.campaign") },
  ]
  const [tab, setTab] = useState<AuditLog["category"] | "all">("all")
  const filtered = useMemo(
    () => (tab === "all" ? auditLogs : auditLogs.filter((l) => l.category === tab)),
    [tab],
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("adminAudit.title")} description={t("adminAudit.description")} />

      <Tabs value={tab} onValueChange={(v) => setTab(v as AuditLog["category"] | "all")}>
        <TabsList>
          {tabs.map((tabItem) => (
            <TabsTrigger key={tabItem.value} value={tabItem.value}>
              {tabItem.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>{t("adminAudit.events")}</CardTitle>
          <CardDescription>{t("adminAudit.entries", { count: filtered.length })}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          {filtered.map((log, i, arr) => {
            const c = categoryConfig[log.category]
            return (
              <div key={log.id}>
                <div className="flex items-start gap-4 py-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <c.icon className="size-4 text-muted-foreground" />
                  </div>
                  <div className="flex flex-1 flex-col gap-0.5">
                    <span className="text-sm">{log.action}</span>
                    <span className="text-xs text-muted-foreground">
                      {log.actor} &rarr; {log.target}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="secondary">{c.label}</Badge>
                    <span className="text-xs text-muted-foreground">{log.time}</span>
                  </div>
                </div>
                {i < arr.length - 1 && <div className="border-t border-border" />}
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
