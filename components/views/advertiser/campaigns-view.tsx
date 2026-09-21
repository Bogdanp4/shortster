"use client"

import { useMemo, useState } from "react"
import { PlusCircle, Search } from "lucide-react"

import { useApp } from "@/components/app/app-provider"
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
import { useT } from "@/components/i18n/locale-provider"

const tabValues: (CampaignStatus | "all")[] = ["all", "active", "paused", "completed"]

export function AdvertiserCampaignsView() {
  const { navigate, campaigns } = useApp()
  const t = useT()
  const [tab, setTab] = useState<CampaignStatus | "all">("all")
  const [query, setQuery] = useState("")

  const tabLabels: Record<CampaignStatus | "all", string> = {
    all: t("campaignsList.all"),
    active: t("campaignsList.active"),
    paused: t("campaignsList.paused"),
    completed: t("campaignsList.completed"),
    draft: t("status.draft"),
    cancelled: t("status.campaign.cancelled"),
  }

  const filtered = useMemo(
    () =>
      campaigns.filter((c) => {
        const matchTab = tab === "all" || c.status === tab
        const matchQuery = c.title.toLowerCase().includes(query.toLowerCase())
        return matchTab && matchQuery
      }),
    [tab, query, campaigns],
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("campaignsList.title")} description={t("campaignsList.description")}>
        <Button onClick={() => navigate("create")}>
          <PlusCircle data-icon="inline-start" />
          {t("campaignsList.createCampaign")}
        </Button>
      </PageHeader>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={tab} onValueChange={(v) => setTab(v as CampaignStatus | "all")}>
          <TabsList>
            {tabValues.map((v) => (
              <TabsTrigger key={v} value={v}>
                {tabLabels[v]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <InputGroup className="sm:max-w-xs">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            placeholder={t("campaignsList.searchPlaceholder")}
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
                <TableHead>{t("campaignsList.colCampaign")}</TableHead>
                <TableHead>{t("campaignsList.colPlatforms")}</TableHead>
                <TableHead className="text-right">{t("campaignsList.colViews")}</TableHead>
                <TableHead className="text-right">{t("campaignsList.colSubmissions")}</TableHead>
                <TableHead className="w-[200px]">{t("campaignsList.colBudget")}</TableHead>
                <TableHead>{t("campaignsList.colStatus")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => {
                const pct = Math.round((c.creatorBudgetSpentMinor / c.creatorBudgetMinor) * 100)
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
                          <span className="text-xs text-muted-foreground">{t(`card.category.${c.category}`)}</span>
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
                          {formatCurrency(c.creatorBudgetSpentMinor)} / {formatCurrency(c.creatorBudgetMinor)}
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
