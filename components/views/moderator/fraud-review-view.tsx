"use client"

import { ShieldAlert, Ban, Check, Link2 } from "lucide-react"
import { toast } from "sonner"

import { fraudCases } from "@/lib/mock-data"
import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { RiskBadge } from "@/components/shared/status-badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { useT } from "@/components/i18n/locale-provider"

export function FraudReviewView() {
  const t = useT()
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("fraudReview.title")} description={t("fraudReview.description")} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={t("fraudReview.openCases")} value={fraudCases.length} icon={ShieldAlert} />
        <StatCard label={t("fraudReview.accountsBanned")} value={12} icon={Ban} hint={t("fraudReview.thisMonth")} />
        <StatCard label={t("fraudReview.recovered")} value="$4,820" hint={t("fraudReview.reversedPayouts")} />
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
                    {c.creatorHandle} · {t("fraudReview.flaggedOn", { campaign: c.campaign })}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.success(t("fraudReview.clearedToast", { handle: c.creatorHandle }))}
                  >
                    <Check data-icon="inline-start" />
                    {t("fraudReview.clear")}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => toast.error(t("fraudReview.bannedToast", { handle: c.creatorHandle }))}
                  >
                    <Ban data-icon="inline-start" />
                    {t("fraudReview.banAccount")}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-6 lg:grid-cols-3">
              <div className="flex flex-col gap-3 lg:col-span-2">
                <span className="text-sm font-medium">{t("fraudReview.riskSignals")}</span>
                {c.flags.map((f) => (
                  <div key={f.reason} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{f.reason}</span>
                      <span className="font-medium tabular-nums">+{f.points}</span>
                    </div>
                    <Progress value={f.points} />
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-sm font-medium">{t("fraudReview.history")}</span>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("fraudReview.submissions")}</span>
                  <span className="font-medium">{c.previousSubmissions}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("fraudReview.rejected")}</span>
                  <span className="font-medium">{c.rejectedSubmissions}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Link2 className="size-3.5" />
                    {t("fraudReview.linkedAccounts")}
                  </span>
                  <span className="font-medium">{c.linkedAccounts}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
