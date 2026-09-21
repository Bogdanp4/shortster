"use client"

import { CheckCircle2, XCircle, Flag } from "lucide-react"

import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useT } from "@/components/i18n/locale-provider"

type Action = "approved" | "rejected" | "flagged"

const history: { id: string; action: Action; submission: string; creator: string; campaign: string; time: string; note?: string }[] = [
  { id: "h1", action: "approved", submission: "SUB-1041", creator: "Alex Rivera", campaign: "Stake Highlights", time: "14:32" },
  { id: "h2", action: "rejected", submission: "SUB-1044", creator: "Alex Rivera", campaign: "Music Promotion", time: "13:58", note: "Audio not used for required duration" },
  { id: "h3", action: "approved", submission: "SUB-1039", creator: "Mia Chen", campaign: "Gaming Clips", time: "13:20" },
  { id: "h4", action: "flagged", submission: "SUB-1038", creator: "Jordan Lee", campaign: "AI App UGC", time: "12:47", note: "Sent to fraud review" },
  { id: "h5", action: "approved", submission: "SUB-1035", creator: "Dani Vasquez", campaign: "Music Promotion", time: "12:10" },
  { id: "h6", action: "rejected", submission: "SUB-1033", creator: "Sam Okafor", campaign: "Sports Highlights", time: "11:35", note: "Missing intro sting" },
]

const config: Record<Action, { icon: typeof CheckCircle2; className: string }> = {
  approved: { icon: CheckCircle2, className: "text-primary" },
  rejected: { icon: XCircle, className: "text-destructive" },
  flagged: { icon: Flag, className: "text-chart-4" },
}

export function ModerationHistoryView() {
  const t = useT()
  const label: Record<Action, string> = {
    approved: t("modHistory.approved"),
    rejected: t("modHistory.rejected"),
    flagged: t("modHistory.flagged"),
  }
  const approved = history.filter((h) => h.action === "approved").length
  const rejected = history.filter((h) => h.action === "rejected").length
  const flagged = history.filter((h) => h.action === "flagged").length

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("modHistory.title")} description={t("modHistory.description")} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={t("modHistory.approved")} value={approved} icon={CheckCircle2} />
        <StatCard label={t("modHistory.rejected")} value={rejected} icon={XCircle} />
        <StatCard label={t("modHistory.flagged")} value={flagged} icon={Flag} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("modHistory.todaysActivity")}</CardTitle>
          <CardDescription>{t("modHistory.todaysActivityDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          {history.map((h, i, arr) => {
            const c = config[h.action]
            return (
              <div key={h.id}>
                <div className="flex items-start gap-4 py-3">
                  <c.icon className={`mt-0.5 size-5 shrink-0 ${c.className}`} />
                  <div className="flex flex-1 flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{label[h.action]}</span>
                      <span className="font-mono text-xs text-muted-foreground">{h.submission}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {h.creator} · {h.campaign}
                    </span>
                    {h.note && <span className="text-xs text-muted-foreground">{h.note}</span>}
                  </div>
                  <span className="text-xs text-muted-foreground">{h.time}</span>
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
