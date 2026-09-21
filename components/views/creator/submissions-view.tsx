"use client"

import { useMemo, useState } from "react"
import { ExternalLink } from "lucide-react"

import { useApp } from "@/components/app/app-provider"
import { useT } from "@/components/i18n/locale-provider"
import { formatCurrency, formatNumber, formatRelative } from "@/lib/format"
import type { SubmissionStatus } from "@/lib/types"
import { PageHeader } from "@/components/shared/page-header"
import { PlatformIcon } from "@/components/shared/platform-icon"
import { SubmissionStatusBadge } from "@/components/shared/status-badge"
import { StatCard } from "@/components/shared/stat-card"
import { BrandAvatar } from "@/components/shared/brand-avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"

export function SubmissionsView() {
  const { navigate, submissions } = useApp()
  const t = useT()
  const [tab, setTab] = useState<SubmissionStatus | "all">("all")

  const tabs: { value: SubmissionStatus | "all"; label: string }[] = [
    { value: "all", label: t("creatorSubs.tabAll") },
    { value: "pending", label: t("creatorSubs.tabPending") },
    { value: "approved", label: t("creatorSubs.tabApproved") },
    { value: "credited", label: t("creatorSubs.tabCredited") },
    { value: "rejected", label: t("creatorSubs.tabRejected") },
  ]

  const filtered = useMemo(
    () => (tab === "all" ? submissions : submissions.filter((s) => s.status === tab)),
    [tab, submissions],
  )

  const totalEarned = submissions
    .filter((s) => s.status === "credited")
    .reduce((sum, s) => sum + (s.finalRewardMinor ?? s.calculatedRewardMinor), 0)
  const totalViews = submissions.reduce((sum, s) => sum + s.viewsAtSubmission, 0)
  const pendingCount = submissions.filter((s) => s.status === "pending").length

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("creatorSubs.title")} description={t("creatorSubs.description")} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={t("creatorSubs.statCredited")} value={formatCurrency(totalEarned)} hint={t("creatorSubs.statCreditedHint")} />
        <StatCard label={t("creatorSubs.statViews")} value={formatNumber(totalViews)} hint={t("creatorSubs.statViewsHint")} />
        <StatCard label={t("creatorSubs.statPending")} value={pendingCount} hint={t("creatorSubs.statPendingHint")} />
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as SubmissionStatus | "all")}>
        <TabsList>
          {tabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("table.campaign")}</TableHead>
                <TableHead>{t("table.account")}</TableHead>
                <TableHead className="text-right">{t("table.views")}</TableHead>
                <TableHead className="text-right">{t("table.reward")}</TableHead>
                <TableHead>{t("table.status")}</TableHead>
                <TableHead>{t("table.submitted")}</TableHead>
                <TableHead className="text-right">{t("table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow
                  key={s.id}
                  className="cursor-pointer"
                  onClick={() => navigate("submission", { id: s.id })}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <BrandAvatar name={s.brand} src={s.cover} className="size-9" />
                      <div className="flex flex-col">
                        <span className="font-medium">{s.campaignTitle}</span>
                        <span className="text-xs text-muted-foreground">{s.brand}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <PlatformIcon platform={s.platform} className="size-4" />
                      <span className="text-muted-foreground">{s.accountHandle}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatNumber(s.viewsAtSubmission)}</TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatCurrency(s.finalRewardMinor ?? s.calculatedRewardMinor)}
                  </TableCell>
                  <TableCell>
                    <SubmissionStatusBadge status={s.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatRelative(s.submittedAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(s.videoUrl, "_blank")
                      }}
                    >
                      <ExternalLink />
                      <span className="sr-only">{t("submissions.openVideo")}</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
