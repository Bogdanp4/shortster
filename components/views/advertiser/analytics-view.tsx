"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart } from "recharts"
import { Eye, DollarSign, TrendingUp } from "lucide-react"

import { campaigns, advertiserStatsSeries } from "@/lib/mock-data"
import { formatCurrency, formatNumber } from "@/lib/format"
import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { BrandAvatar } from "@/components/shared/brand-avatar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

const viewsConfig = {
  views: { label: "Views", color: "var(--chart-1)" },
} satisfies ChartConfig

const spendConfig = {
  spend: { label: "Spend", color: "var(--chart-2)" },
} satisfies ChartConfig

export function AdvertiserAnalyticsView() {
  const totalViews = campaigns.reduce((s, c) => s + c.views, 0)
  const totalSpent = campaigns.reduce((s, c) => s + c.spent, 0)
  const cpm = totalViews > 0 ? (totalSpent / totalViews) * 1000 : 0
  const maxViews = Math.max(...campaigns.map((c) => c.views))

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Analytics" description="Deep dive into your campaign performance." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total views" value={formatNumber(totalViews)} icon={Eye} trend={{ value: "+18.2%", positive: true }} />
        <StatCard label="Total spent" value={formatCurrency(totalSpent)} icon={DollarSign} trend={{ value: "+9.4%", positive: true }} />
        <StatCard label="Effective CPM" value={formatCurrency(cpm)} icon={TrendingUp} hint="Cost per 1K views" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Views trend</CardTitle>
            <CardDescription>Daily verified views</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={viewsConfig} className="aspect-[2/1] w-full">
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
            <CardTitle>Spend trend</CardTitle>
            <CardDescription>Daily payout spend</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={spendConfig} className="aspect-[2/1] w-full">
              <LineChart data={advertiserStatsSeries} margin={{ left: 12, right: 12, top: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => `$${v}`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line dataKey="spend" type="natural" stroke="var(--color-spend)" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaign leaderboard</CardTitle>
          <CardDescription>Ranked by total views</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {[...campaigns]
            .sort((a, b) => b.views - a.views)
            .map((c) => (
              <div key={c.id} className="flex items-center gap-4">
                <BrandAvatar name={c.brand} src={c.cover} className="size-9" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{c.title}</span>
                    <span className="text-sm tabular-nums text-muted-foreground">{formatNumber(c.views)}</span>
                  </div>
                  <Progress value={Math.round((c.views / maxViews) * 100)} />
                </div>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  )
}
