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

export function ReviewQueueView() {
  const { navigate } = useApp()
  const avgWait = "27 min"
  const highRisk = moderationQueue.filter((s) => s.riskScore >= 40).length

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Review Queue" description="Approve or reject creator submissions. Highest risk first." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="In queue" value={moderationQueue.length} icon={Clock} />
        <StatCard label="High risk" value={highRisk} icon={AlertTriangle} hint="Risk score ≥ 40" />
        <StatCard label="Avg. wait" value={avgWait} hint="Time to first review" />
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
                          Manual
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <PlatformIcon platform={s.platform} className="size-3.5" />
                        {s.creatorName} · {s.accountHandle}
                      </span>
                      <span>{formatNumber(s.viewsAtSubmission)} views</span>
                      <span>{formatCurrency(s.cappedReward ?? s.reward)} reward</span>
                      <span>{formatRelative(s.submittedAt)}</span>
                    </div>
                  </div>
                </button>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.success(`Approved ${s.id.toUpperCase()}`)}
                  >
                    <Check data-icon="inline-start" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.error(`Rejected ${s.id.toUpperCase()}`)}
                  >
                    <X data-icon="inline-start" />
                    Reject
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => navigate("review", { submissionId: s.id })}>
                    <ChevronRight />
                    <span className="sr-only">Review details</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  )
}
