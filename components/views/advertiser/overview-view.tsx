"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Eye, DollarSign, FileVideo, Users, PlusCircle } from "lucide-react"

import { useApp } from "@/components/app/app-provider"
import { useT } from "@/components/i18n/locale-provider"
import { advertiserStatsSeries } from "@/lib/mock-data"
import { formatCurrency, formatNumber } from "@/lib/format"
import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { CampaignStatusBadge } from "@/components/shared/status-badge"
import { BrandAvatar } from "@/components/shared/brand-avatar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

export function AdvertiserOverviewView() {
  const { navigate, campaigns, advertiserWallet } = useApp()
  const t = useT()
  const chartConfig = {
    views: { label: t("advOverview.totalViews"), color: "var(--chart-1)" },
  } satisfies ChartConfig
  const active = campaigns.filter((c) => c.status === "active")
  const spentPct = (c: (typeof campaigns)[number]) => Math.round((c.creatorBudgetSpentMinor / c.creatorBudgetMinor) * 100)
  const totalViews = campaigns.reduce((s, c) => s + c.views, 0)
  const totalSubmissions = campaigns.reduce((s, c) => s + c.submissionsCount, 0)
  const totalCreators = campaigns.reduce((s, c) => s + c.creators, 0)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("advOverview.title")} description={t("advOverview.description")}>
        <Button onClick={() => navigate("create")}>
          <PlusCircle data-icon="inline-start" />
          {t("advOverview.createCampaign")}
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t("advOverview.totalViews")} value={formatNumber(totalViews)} icon={Eye} trend={{ value: "+18.2%", positive: true }} />
        <StatCard label={t("advOverview.totalSpent")} value={formatCurrency(advertiserWallet.totalSpentMinor)} icon={DollarSign} trend={{ value: "+9.4%", positive: true }} />
        <StatCard label={t("advOverview.submissions")} value={formatNumber(totalSubmissions)} icon={FileVideo} trend={{ value: "+12", positive: true }} />
        <StatCard label={t("advOverview.creators")} value={formatNumber(totalCreators)} icon={Users} trend={{ value: "+34", positive: true }} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("advOverview.viewsThisWeek")}</CardTitle>
            <CardDescription>{t("advOverview.viewsThisWeekDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="aspect-[2/1] w-full">
              <BarChart data={advertiserStatsSeries} margin={{ left: 12, right: 12, top: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => `${v / 1000}K`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="views" fill="var(--color-views)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("advOverview.wallet")}</CardTitle>
            <CardDescription>{t("advOverview.walletDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">{t("advOverview.available")}</span>
              <span className="text-2xl font-semibold text-primary tabular-nums">
                {formatCurrency(advertiserWallet.availableMinor)}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">{t("advOverview.reservedForCampaigns")}</span>
              <span className="text-lg font-medium tabular-nums">
                {formatCurrency(advertiserWallet.reservedCreatorBudgetMinor + advertiserWallet.reservedPlatformFeeMinor)}
              </span>
            </div>
            <Button variant="outline" onClick={() => navigate("wallet")}>
              {t("advOverview.addFunds")}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("advOverview.activeCampaigns")}</CardTitle>
          <CardDescription>{t("advOverview.activeCampaignsDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {active.map((c) => {
            const pct = spentPct(c)
            return (
              <button
                key={c.id}
                className="flex flex-col gap-3 rounded-lg border border-border p-4 text-left transition-colors hover:bg-muted/50"
                onClick={() => navigate("adv-campaign", { campaignId: c.id })}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <BrandAvatar name={c.brand} src={c.cover} className="size-10" />
                    <div className="flex flex-col">
                      <span className="font-medium">{c.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {t("advOverview.viewsSubmissions", { views: formatNumber(c.views), count: c.submissionsCount })}
                      </span>
                    </div>
                  </div>
                  <CampaignStatusBadge status={c.status} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {t("advOverview.spentOfBudget", {
                        spent: formatCurrency(c.creatorBudgetSpentMinor),
                        budget: formatCurrency(c.creatorBudgetMinor),
                      })}
                    </span>
                    <span className="text-muted-foreground">{pct}%</span>
                  </div>
                  <Progress value={pct} />
                </div>
              </button>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
