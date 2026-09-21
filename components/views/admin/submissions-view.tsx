"use client"

import { useMemo, useState } from "react"
import { FileVideo, Search } from "lucide-react"

import { moderationQueue, creatorSubmissions } from "@/lib/mock-data"
import { formatCurrency, formatNumber } from "@/lib/format"
import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { SubmissionStatusBadge, RiskBadge } from "@/components/shared/status-badge"
import { PlatformIcon } from "@/components/shared/platform-icon"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/ui/input-group"
import { useT } from "@/components/i18n/locale-provider"

const allSubmissions = [...moderationQueue, ...creatorSubmissions]

export function AdminSubmissionsView() {
  const t = useT()
  const [query, setQuery] = useState("")
  const filtered = useMemo(
    () =>
      allSubmissions.filter(
        (s) =>
          s.campaignTitle.toLowerCase().includes(query.toLowerCase()) ||
          s.creatorHandle.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  )

  const totalViews = allSubmissions.reduce((s, x) => s + x.viewsAtSubmission, 0)
  const totalRewards = allSubmissions.reduce((s, x) => s + (x.finalRewardMinor ?? x.calculatedRewardMinor), 0)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("adminSubmissions.title")} description={t("adminSubmissions.description")} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={t("adminSubmissions.totalSubmissions")} value={allSubmissions.length} icon={FileVideo} />
        <StatCard label={t("adminSubmissions.combinedViews")} value={formatNumber(totalViews)} />
        <StatCard label={t("adminSubmissions.rewardsPaid")} value={formatCurrency(totalRewards)} />
      </div>

      <div className="flex justify-end">
        <InputGroup className="sm:max-w-xs">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            placeholder={t("adminSubmissions.searchSubmissions")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </InputGroup>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("adminSubmissions.campaign")}</TableHead>
                <TableHead>{t("adminSubmissions.creator")}</TableHead>
                <TableHead>{t("adminSubmissions.platform")}</TableHead>
                <TableHead className="text-right">{t("adminSubmissions.views")}</TableHead>
                <TableHead className="text-right">{t("adminSubmissions.reward")}</TableHead>
                <TableHead>{t("adminSubmissions.risk")}</TableHead>
                <TableHead>{t("adminSubmissions.status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.campaignTitle}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{s.creatorHandle}</TableCell>
                  <TableCell>
                    <PlatformIcon platform={s.platform} className="size-4" />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatNumber(s.viewsAtSubmission)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(s.finalRewardMinor ?? s.calculatedRewardMinor)}
                  </TableCell>
                  <TableCell>
                    <RiskBadge score={s.riskScore} />
                  </TableCell>
                  <TableCell>
                    <SubmissionStatusBadge status={s.status} />
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
