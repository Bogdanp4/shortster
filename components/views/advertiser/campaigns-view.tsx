"use client"

import { useMemo, useState } from "react"
import { PlusCircle, Search } from "lucide-react"

import { useApp } from "@/components/app/app-provider"
import { campaigns } from "@/lib/mock-data"
import { formatCurrency, formatNumber } from "@/lib/format"
import type { CampaignStatus } from "@/lib/types"
import { PageHeader } from "@/components/shared/page-header"
import { CampaignStatusBadge } from "@/components/shared/status-badge"
import { PlatformIcon } from "@/components/shared/platform-icon"
import { BrandAvatar } from "@/components/shared/brand-avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/ui/input-group"

const tabs: { value: CampaignStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" },
]

export function AdvertiserCampaignsView() {
  const { navigate } = useApp()
  const [tab, setTab] = useState<CampaignStatus | "all">("all")
  const [query, setQuery] = useState("")

  const filtered = useMemo(
    () =>
      campaigns.filter((c) => {
        const matchTab = tab === "all" || c.status === tab
        const matchQuery = c.title.toLowerCase().includes(query.toLowerCase())
        return matchTab && matchQuery
      }),
    [tab, query],
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Campaigns" description="Manage every campaign you're running.">
        <Button onClick={() => navigate("create")}>
          <PlusCircle data-icon="inline-start" />
          Create campaign
        </Button>
      </PageHeader>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={tab} onValueChange={(v) => setTab(v as CampaignStatus | "all")}>
          <TabsList>
            {tabs.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <InputGroup className="sm:max-w-xs">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput placeholder="Search campaigns" value={query} onChange={(e) => setQuery(e.target.value)} />
        </InputGroup>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Platforms</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Submissions</TableHead>
                <TableHead className="w-[200px]">Budget</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => {
                const pct = Math.round((c.spent / c.budget) * 100)
                return (
                  <TableRow
                    key={c.id}
                    className="cursor-pointer"
                    onClick={() => navigate("adv-campaign", { campaignId: c.id })}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <BrandAvatar name={c.brand} src={c.cover} className="size-9" />
                        <div className="flex flex-col">
                          <span className="font-medium">{c.title}</span>
                          <span className="text-xs text-muted-foreground">{c.category}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {c.platforms.map((p) => (
                          <PlatformIcon key={p} platform={p} className="size-4" />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{formatNumber(c.views)}</TableCell>
                    <TableCell className="text-right tabular-nums">{c.submissionsCount}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs text-muted-foreground">
                          {formatCurrency(c.spent)} / {formatCurrency(c.budget)}
                        </span>
                        <Progress value={pct} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <CampaignStatusBadge status={c.status} />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
