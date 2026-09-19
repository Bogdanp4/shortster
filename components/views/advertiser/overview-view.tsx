"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Eye, DollarSign, FileVideo, Users, PlusCircle } from "lucide-react"

import { useApp } from "@/components/app/app-provider"
import { campaigns, advertiserStatsSeries, advertiserWallet } from "@/lib/mock-data"
import { formatCurrency, formatNumber } from "@/lib/format"
import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { CampaignStatusBadge } from "@/components/shared/status-badge"
import { BrandAvatar } from "@/components/shared/brand-avatar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

const chartConfig = {
  views: { label: "Views", color: "var(--chart-1)" },
} satisfies ChartConfig

export function AdvertiserOverviewView() {
  const { navigate } = useApp()
  const active = campaigns.filter((c) => c.status === "active")
  const totalViews = campaigns.reduce((s, c) => s + c.views, 0)
  const totalSubmissions = campaigns.reduce((s, c) => s + c.submissionsCount, 0)
  const totalCreators = campaigns.reduce((s, c) => s + c.creators, 0)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Overview" description="Performance across all your campaigns.">
        <Button onClick={() => navigate("create")}>
          <PlusCircle data-icon="inline-start" />
          Create campaign
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total views" value={formatNumber(totalViews)} icon={Eye} trend={{ value: "+18.2%", positive: true }} />
        <StatCard label="Total spent" value={formatCurrency(advertiserWallet.totalSpent)} icon={DollarSign} trend={{ value: "+9.4%", positive: true }} />
        <StatCard label="Submissions" value={formatNumber(totalSubmissions)} icon={FileVideo} trend={{ value: "+12", positive: true }} />
        <StatCard label="Creators" value={formatNumber(totalCreators)} icon={Users} trend={{ value: "+34", positive: true }} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Views this week</CardTitle>
            <CardDescription>Verified views across active campaigns</CardDescription>
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
            <CardTitle>Wallet</CardTitle>
            <CardDescription>Available and reserved funds</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Available</span>
              <span className="text-2xl font-semibold text-primary tabular-nums">
                {formatCurrency(advertiserWallet.available)}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Reserved for campaigns</span>
              <span className="text-lg font-medium tabular-nums">{formatCurrency(advertiserWallet.reserved)}</span>
            </div>
            <Button variant="outline" onClick={() => navigate("wallet")}>
              Add funds
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active campaigns</CardTitle>
          <CardDescription>Budget usage and reach</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {active.map((c) => {
            const pct = Math.round((c.spent / c.budget) * 100)
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
                        {formatNumber(c.views)} views · {c.submissionsCount} submissions
                      </span>
                    </div>
                  </div>
                  <CampaignStatusBadge status={c.status} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {formatCurrency(c.spent)} of {formatCurrency(c.budget)}
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
