"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Pause, Eye, DollarSign, FileVideo, Users, Pencil } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

import { useApp } from "@/components/app/app-provider"
import { campaigns, getCampaign, moderationQueue, advertiserStatsSeries } from "@/lib/mock-data"
import { formatCurrency, formatNumber, categoryLabel } from "@/lib/format"
import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { CampaignStatusBadge, SubmissionStatusBadge } from "@/components/shared/status-badge"
import { PlatformIcon } from "@/components/shared/platform-icon"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

const chartConfig = {
  views: { label: "Views", color: "var(--chart-1)" },
  spend: { label: "Spend", color: "var(--chart-2)" },
} satisfies ChartConfig

export function AdvertiserCampaignDetailView() {
  const { selectedCampaignId, navigate } = useApp()
  const campaign = getCampaign(selectedCampaignId ?? "stake-highlights") ?? campaigns[0]
  const pct = Math.round((campaign.spent / campaign.budget) * 100)
  const submissions = moderationQueue.filter((s) => s.campaignId === campaign.id)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={campaign.title}
        description={`${categoryLabel[campaign.category]} · ${campaign.brand}`}
        backLabel="Back to campaigns"
        onBack={() => navigate("campaigns")}
      >
        <Button variant="outline" onClick={() => toast.info("Campaign paused")}>
          <Pause data-icon="inline-start" />
          Pause
        </Button>
        <Button variant="outline" onClick={() => toast.info("Opening editor…")}>
          <Pencil data-icon="inline-start" />
          Edit
        </Button>
      </PageHeader>

      <div className="flex items-center gap-3">
        <CampaignStatusBadge status={campaign.status} />
        <span className="text-sm text-muted-foreground">
          {campaign.startDate} – {campaign.endDate}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Views" value={formatNumber(campaign.views)} icon={Eye} />
        <StatCard label="Spent" value={formatCurrency(campaign.spent)} icon={DollarSign} />
        <StatCard label="Submissions" value={campaign.submissionsCount} icon={FileVideo} />
        <StatCard label="Creators" value={campaign.creators} icon={Users} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Budget usage</CardTitle>
          <CardDescription>
            {formatCurrency(campaign.spent)} of {formatCurrency(campaign.budget)} spent
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Progress value={pct} />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{pct}% used</span>
            <span>{formatCurrency(campaign.budget - campaign.spent)} remaining</span>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="performance">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="brief">Brief</TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Views & spend</CardTitle>
              <CardDescription>Daily performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="aspect-[3/1] w-full">
                <AreaChart data={advertiserStatsSeries} margin={{ left: 12, right: 12, top: 8 }}>
                  <defs>
                    <linearGradient id="fillViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-views)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--color-views)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => `${v / 1000}K`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area dataKey="views" type="natural" fill="url(#fillViews)" stroke="var(--color-views)" strokeWidth={2} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Creator</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                    <TableHead className="text-right">Reward</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                        No submissions yet for this campaign.
                      </TableCell>
                    </TableRow>
                  )}
                  {submissions.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{s.creatorName}</span>
                          <span className="text-xs text-muted-foreground">{s.creatorHandle}</span>
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="brief">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="text-sm leading-relaxed text-muted-foreground">{campaign.description}</p>
                <Separator />
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium">Requirements</span>
                  <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                    {campaign.requirements.map((r) => (
                      <li key={r}>· {r}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Terms</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 text-sm">
                <Row label="Rate" value={`${formatCurrency(campaign.ratePerMillion)} / 1M`} />
                <Row label="Min views" value={formatNumber(campaign.minViews)} />
                <Row label="Max / video" value={formatCurrency(campaign.maxPayoutPerVideo)} />
                <Row label="Max / account" value={formatCurrency(campaign.maxPayoutPerAccount)} />
                <Row label="Duration" value={`${campaign.minDuration}–${campaign.maxDuration}s`} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
