"use client"

import { useMemo, useState } from "react"
import { ShieldCheck, DollarSign, UserCog, Megaphone, Activity } from "lucide-react"

import { auditLogs } from "@/lib/mock-data"
import type { AuditLog } from "@/lib/types"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const categoryConfig: Record<AuditLog["category"], { icon: typeof Activity; label: string }> = {
  moderation: { icon: ShieldCheck, label: "Moderation" },
  financial: { icon: DollarSign, label: "Financial" },
  account: { icon: UserCog, label: "Account" },
  campaign: { icon: Megaphone, label: "Campaign" },
}

const tabs: { value: AuditLog["category"] | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "moderation", label: "Moderation" },
  { value: "financial", label: "Financial" },
  { value: "account", label: "Account" },
  { value: "campaign", label: "Campaign" },
]

export function AdminAuditView() {
  const [tab, setTab] = useState<AuditLog["category"] | "all">("all")
  const filtered = useMemo(
    () => (tab === "all" ? auditLogs : auditLogs.filter((l) => l.category === tab)),
    [tab],
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Audit Logs" description="Immutable record of every significant platform action." />

      <Tabs value={tab} onValueChange={(v) => setTab(v as AuditLog["category"] | "all")}>
        <TabsList>
          {tabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Events</CardTitle>
          <CardDescription>{filtered.length} entries</CardDescription>
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
