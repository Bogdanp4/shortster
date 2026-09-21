"use client"

import { ShieldAlert, Ban, Check } from "lucide-react"
import { toast } from "sonner"

import { fraudCases } from "@/lib/mock-data"
import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { RiskBadge } from "@/components/shared/status-badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useT } from "@/components/i18n/locale-provider"

export function AdminFraudView() {
  const t = useT()
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("adminFraud.title")} description={t("adminFraud.description")} />

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label={t("adminFraud.openCases")} value={fraudCases.length} icon={ShieldAlert} />
        <StatCard label={t("adminFraud.banned30d")} value={12} icon={Ban} />
        <StatCard label={t("adminFraud.recovered")} value="$4,820" />
        <StatCard label={t("adminFraud.falsePositives")} value="6%" />
      </div>

      <div className="flex flex-col gap-6">
        {fraudCases.map((c) => (
          <Card key={c.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <CardTitle className="flex items-center gap-2">
                    {c.creatorName}
                    <RiskBadge score={c.riskScore} />
                  </CardTitle>
                  <CardDescription>
                    {c.creatorHandle} · {c.campaign} · {t("adminFraud.linkedAccounts", { count: c.linkedAccounts })}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.success(t("adminFraud.clearedToast", { handle: c.creatorHandle }))}
                  >
                    <Check data-icon="inline-start" />
                    {t("adminFraud.clear")}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => toast.error(t("adminFraud.bannedToast", { handle: c.creatorHandle }))}
                  >
                    <Ban data-icon="inline-start" />
                    {t("adminFraud.ban")}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {c.flags.map((f) => (
                <div key={f.reason} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{f.reason}</span>
                    <Badge variant="secondary">+{f.points}</Badge>
                  </div>
                  <Progress value={f.points} />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
