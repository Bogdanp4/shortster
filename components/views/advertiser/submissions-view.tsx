"use client"

import { useMemo, useState } from "react"
import { ExternalLink } from "lucide-react"

import { moderationQueue } from "@/lib/mock-data"
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
import { useT } from "@/components/i18n/locale-provider"

export function AdvertiserSubmissionsView() {
  const t = useT()
  const tabs: { value: SubmissionStatus | "all"; label: string }[] = [
    { value: "all", label: t("advSubmissions.all") },
    { value: "pending", label: t("statuses.pending") },
    { value: "approved", label: t("statuses.approved") },
    { value: "credited", label: t("statuses.credited") },
  ]
  const [tab, setTab] = useState<SubmissionStatus | "all">("all")
  const filtered = useMemo(
    () => (tab === "all" ? moderationQueue : moderationQueue.filter((s) => s.status === tab)),
    [tab],
  )

  const totalViews = moderationQueue.reduce((s, x) => s + x.viewsAtSubmission, 0)
  const totalReward = moderationQueue.reduce((s, x) => s + (x.cappedReward ?? x.reward), 0)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("advSubmissions.title")} description={t("advSubmissions.description")} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={t("advSubmissions.totalSubmissions")} value={moderationQueue.length} />
        <StatCard label={t("advSubmissions.combinedViews")} value={formatNumber(totalViews)} />
        <StatCard label={t("advSubmissions.rewardValue")} value={formatCurrency(totalReward)} />
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as SubmissionStatus | "all")}>
        <TabsList>
          {tabs.map((tb) => (
            <TabsTrigger key={tb.value} value={tb.value}>
              {tb.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("advSubmissions.creator")}</TableHead>
                <TableHead>{t("advSubmissions.campaign")}</TableHead>
                <TableHead>{t("advSubmissions.platform")}</TableHead>
                <TableHead className="text-right">{t("advSubmissions.views")}</TableHead>
                <TableHead className="text-right">{t("advSubmissions.reward")}</TableHead>
                <TableHead>{t("advSubmissions.status")}</TableHead>
                <TableHead>{t("advSubmissions.submitted")}</TableHead>
                <TableHead className="text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{s.creatorName}</span>
                      <span className="text-xs text-muted-foreground">{s.creatorHandle}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <BrandAvatar name={s.brand} src={s.cover} className="size-7" />
                      <span className="text-sm">{s.campaignTitle}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <PlatformIcon platform={s.platform} className="size-4" />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatNumber(s.viewsAtSubmission)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCurrency(s.cappedReward ?? s.reward)}</TableCell>
                  <TableCell>
                    <SubmissionStatusBadge status={s.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatRelative(s.submittedAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon-sm" onClick={() => window.open(s.videoUrl, "_blank")}>
                      <ExternalLink />
                      <span className="sr-only">{t("advSubmissions.openVideo")}</span>
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
