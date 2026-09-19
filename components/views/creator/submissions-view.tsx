"use client"

import { useMemo, useState } from "react"
import { ExternalLink } from "lucide-react"

import { useApp } from "@/components/app/app-provider"
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

const tabs: { value: SubmissionStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "credited", label: "Credited" },
  { value: "rejected", label: "Rejected" },
]

export function SubmissionsView() {
  const { navigate, submissions } = useApp()
  const [tab, setTab] = useState<SubmissionStatus | "all">("all")

  const filtered = useMemo(
    () => (tab === "all" ? submissions : submissions.filter((s) => s.status === tab)),
    [tab, submissions],
  )

  const totalEarned = submissions
    .filter((s) => s.status === "credited")
    .reduce((sum, s) => sum + (s.cappedReward ?? s.reward), 0)
  const totalViews = submissions.reduce((sum, s) => sum + s.viewsAtSubmission, 0)
  const pendingCount = submissions.filter((s) => s.status === "pending").length

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="My Submissions" description="Track the status and earnings of every video you submit." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total credited" value={formatCurrency(totalEarned)} hint="Across all campaigns" />
        <StatCard label="Total views" value={formatNumber(totalViews)} hint="At submission time" />
        <StatCard label="Pending review" value={pendingCount} hint="Awaiting moderation" />
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
                <TableHead>Campaign</TableHead>
                <TableHead>Account</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Reward</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
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
                    {formatCurrency(s.cappedReward ?? s.reward)}
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
                      <span className="sr-only">Open video</span>
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
