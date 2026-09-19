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

const allSubmissions = [...moderationQueue, ...creatorSubmissions]

export function AdminSubmissionsView() {
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
  const totalRewards = allSubmissions.reduce((s, x) => s + (x.cappedReward ?? x.reward), 0)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Submissions" description="Every submission across all campaigns and creators." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total submissions" value={allSubmissions.length} icon={FileVideo} />
        <StatCard label="Combined views" value={formatNumber(totalViews)} />
        <StatCard label="Rewards paid" value={formatCurrency(totalRewards)} />
      </div>

      <div className="flex justify-end">
        <InputGroup className="sm:max-w-xs">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput placeholder="Search submissions" value={query} onChange={(e) => setQuery(e.target.value)} />
        </InputGroup>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Reward</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Status</TableHead>
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
                    {formatCurrency(s.cappedReward ?? s.reward)}
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
