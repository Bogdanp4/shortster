"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { DollarSign, Users, Megaphone, ShieldAlert } from "lucide-react"

import { useApp } from "@/components/app/app-provider"
import { adminStatsSeries, adminUsers, fraudCases, auditLogs } from "@/lib/mock-data"
import { formatCurrency, formatNumber } from "@/lib/format"
import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { useT } from "@/components/i18n/locale-provider"

export function AdminDashboardView() {
  const { navigate, campaigns } = useApp()
  const t = useT()
  const chartConfig = {
    gmvMinor: { label: "GMV", color: "var(--chart-1)" },
    revenueMinor: { label: t("adminDashboard.revenue"), color: "var(--chart-2)" },
  } satisfies ChartConfig
  const gmvMinor = adminStatsSeries.at(-1)!.gmvMinor
  const revenueMinor = adminStatsSeries.at(-1)!.revenueMinor

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("adminDashboard.title")} description={t("adminDashboard.description")} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t("adminDashboard.monthlyGmv")}
          value={formatCurrency(gmvMinor)}
          icon={DollarSign}
          trend={{ value: "+20.3%", positive: true }}
        />
        <StatCard
          label={t("adminDashboard.platformRevenue")}
          value={formatCurrency(revenueMinor)}
          icon={DollarSign}
          trend={{ value: "+20.3%", positive: true }}
        />
        <StatCard
          label={t("adminDashboard.totalUsers")}
          value={formatNumber(adminUsers.length * 184)}
          icon={Users}
          trend={{ value: "+412", positive: true }}
        />
        <StatCard
          label={t("adminDashboard.activeCampaigns")}
          value={campaigns.filter((c) => c.status === "active").length}
          icon={Megaphone}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("adminDashboard.gmvRevenue")}</CardTitle>
          <CardDescription>{t("adminDashboard.gmvRevenueDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="aspect-[3/1] w-full">
            <AreaChart data={adminStatsSeries} margin={{ left: 12, right: 12, top: 8 }}>
              <defs>
                <linearGradient id="fillGmv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-gmvMinor)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--color-gmvMinor)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-revenueMinor)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--color-revenueMinor)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => `$${v / 100_000}K`} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area dataKey="gmvMinor" type="natural" fill="url(#fillGmv)" stroke="var(--color-gmvMinor)" strokeWidth={2} />
              <Area dataKey="revenueMinor" type="natural" fill="url(#fillRevenue)" stroke="var(--color-revenueMinor)" strokeWidth={2} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("adminDashboard.openFraudCases")}</CardTitle>
            <CardDescription>{t("adminDashboard.requiresAttention")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {fraudCases.map((c) => (
              <button
                key={c.id}
                className="flex items-center justify-between rounded-lg border border-border p-3 text-left transition-colors hover:bg-muted/50"
                onClick={() => navigate("admin-fraud")}
              >
                <div className="flex items-center gap-3">
                  <ShieldAlert className="size-4 text-destructive" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{c.creatorName}</span>
                    <span className="text-xs text-muted-foreground">{c.campaign}</span>
                  </div>
                </div>
                <Badge variant="destructive">{t("adminDashboard.risk", { score: c.riskScore })}</Badge>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("adminDashboard.recentActivity")}</CardTitle>
            <CardDescription>{t("adminDashboard.latestPlatformEvents")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {auditLogs.slice(0, 5).map((log, i, arr) => (
              <div key={log.id}>
                <div className="flex items-start justify-between gap-4 py-2.5">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm">{log.action}</span>
                    <span className="text-xs text-muted-foreground">
                      {log.actor} → {log.target}
                    </span>
                  </div>
                  <span className="whitespace-nowrap text-xs text-muted-foreground">{log.time.split(" ").slice(-1)}</span>
                </div>
                {i < arr.length - 1 && <div className="border-t border-border" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
