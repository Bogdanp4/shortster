"use client"

import { Check, X, ChevronRight, Clock, AlertTriangle, PencilLine } from "lucide-react"
import { toast } from "sonner"

import { useApp } from "@/components/app/app-provider"
import { moderationQueue } from "@/lib/mock-data"
import { formatCurrency, formatNumber, formatRelative } from "@/lib/format"
import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { PlatformIcon } from "@/components/shared/platform-icon"
import { RiskBadge } from "@/components/shared/status-badge"
import { BrandAvatar } from "@/components/shared/brand-avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useT } from "@/components/i18n/locale-provider"

export function ReviewQueueView() {
  const t = useT()
  const { navigate } = useApp()
  const avgWait = "27 min"
  const highRisk = moderationQueue.filter((s) => s.riskScore >= 40).length

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("reviewQueue.title")} description={t("reviewQueue.description")} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={t("reviewQueue.inQueue")} value={moderationQueue.length} icon={Clock} />
        <StatCard label={t("reviewQueue.highRisk")} value={highRisk} icon={AlertTriangle} hint={t("reviewQueue.highRiskHint")} />
        <StatCard label={t("reviewQueue.avgWait")} value={avgWait} hint={t("reviewQueue.avgWaitHint")} />
      </div>

      <div className="flex flex-col gap-3">
        {[...moderationQueue]
          .sort((a, b) => b.riskScore - a.riskScore)
          .map((s) => (
            <Card key={s.id} className="transition-colors hover:bg-muted/40">
              <CardContent className="flex flex-col gap-4 py-4 lg:flex-row lg:items-center">
                <button
                  className="flex flex-1 items-center gap-4 text-left"
                  onClick={() => navigate("review", { submissionId: s.id })}
                >
                  <BrandAvatar name={s.brand} src={s.cover} className="size-12 rounded-lg" />
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{s.campaignTitle}</span>
                      <RiskBadge score={s.riskScore} />
                      {s.metricsMode === "manual" && (
                        <Badge variant="secondary" className="gap-1 text-warning">
                          <PencilLine className="size-3" />
                          {t("reviewQueue.manual")}
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <PlatformIcon platform={s.platform} className="size-3.5" />
                        {s.creatorName} · {s.accountHandle}
                      </span>
                      <span>{formatNumber(s.viewsAtSubmission)} {t("reviewQueue.views")}</span>
                      <span>{formatCurrency(s.cappedReward ?? s.reward)} {t("reviewQueue.reward")}</span>
                      <span>{formatRelative(s.submittedAt)}</span>
                    </div>
                  </div>
                </button>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.success(t("reviewQueue.approvedToast", { id: s.id.toUpperCase() }))}
                  >
                    <Check data-icon="inline-start" />
                    {t("reviewQueue.approve")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.error(t("reviewQueue.rejectedToast", { id: s.id.toUpperCase() }))}
                  >
                    <X data-icon="inline-start" />
                    {t("reviewQueue.reject")}
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => navigate("review", { submissionId: s.id })}>
                    <ChevronRight />
                    <span className="sr-only">{t("reviewQueue.reviewDetails")}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  )
}
