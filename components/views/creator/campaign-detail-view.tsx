"use client"

import Image from "next/image"
import { useApp } from "@/components/app/app-provider"
import { getCampaign } from "@/lib/mock-data"
import { formatMoney, formatNumber, compactNumber, percent } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { CampaignStatusBadge } from "@/components/shared/status-badge"
import { PlatformIcon, platformLabel } from "@/components/shared/platform-icon"
import { BrandAvatar } from "@/components/shared/brand-avatar"
import {
  ArrowLeft,
  CheckCircle2,
  Info,
  FileText,
  FileVideo,
  FileAudio,
  FileArchive,
  ImageIcon,
  Download,
  Globe,
  Clock,
  Eye,
  Send,
} from "lucide-react"

const assetIcon: Record<string, typeof FileText> = {
  image: ImageIcon,
  video: FileVideo,
  audio: FileAudio,
  pdf: FileText,
  archive: FileArchive,
}

export function CampaignDetailView() {
  const { params, navigate } = useApp()
  const campaign = getCampaign(params.id)

  if (!campaign) {
    return (
      <div className="flex flex-col gap-4">
        <Button variant="ghost" onClick={() => navigate("discover")} className="w-fit">
          <ArrowLeft data-icon="inline-start" />
          Back to Discover
        </Button>
        <p className="text-muted-foreground">Campaign not found.</p>
      </div>
    )
  }

  const spentPct = percent(campaign.spent, campaign.budget)
  const remaining = campaign.budget - campaign.spent

  return (
    <div className="flex flex-col gap-6">
      <Button variant="ghost" onClick={() => navigate("discover")} className="w-fit">
        <ArrowLeft data-icon="inline-start" />
        Back to Discover
      </Button>

      <div className="relative overflow-hidden rounded-xl border border-border/60">
        <div className="relative aspect-[21/9] w-full">
          <Image src={campaign.cover || "/placeholder.svg"} alt={`${campaign.title} cover`} fill className="object-cover" priority sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-5 lg:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{campaign.category}</Badge>
            <CampaignStatusBadge status={campaign.status} />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-semibold tracking-tight lg:text-4xl">{campaign.title}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <BrandAvatar name={campaign.brand} className="size-6" />
              <span className="text-sm">by {campaign.brand}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-6">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
              <TabsTrigger value="examples">Examples</TabsTrigger>
              <TabsTrigger value="assets">Assets</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="flex flex-col gap-6 pt-2">
              <Card>
                <CardHeader>
                  <CardTitle>About this campaign</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">{campaign.description}</p>
                  <Separator />
                  <div>
                    <h4 className="mb-3 text-sm font-medium">Instructions</h4>
                    <ul className="flex flex-col gap-2.5">
                      {campaign.instructions.map((ins, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                          {ins}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Alert>
                <Info />
                <AlertTitle>How you get paid</AlertTitle>
                <AlertDescription>
                  You earn {formatMoney(campaign.ratePerMillion)} per 1,000,000 verified views. Payouts are capped at{" "}
                  {formatMoney(campaign.maxPayoutPerVideo)} per video and {formatMoney(campaign.maxPayoutPerAccount)} per account.
                  Views are verified {campaign.minViews.toLocaleString()}+ before crediting.
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="requirements" className="pt-2">
              <Card>
                <CardHeader>
                  <CardTitle>Content requirements</CardTitle>
                  <CardDescription>Submissions that don&apos;t meet these will be rejected.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="grid gap-2.5 sm:grid-cols-2">
                    {campaign.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2.5 rounded-lg border border-border/60 p-3 text-sm">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="examples" className="pt-2">
              <div className="grid gap-4 sm:grid-cols-2">
                {campaign.exampleVideos.map((v) => (
                  <Card key={v.id} className="overflow-hidden pt-0">
                    <div className="relative aspect-video bg-muted">
                      <Image src={v.thumb || "/placeholder.svg"} alt={v.title} fill className="object-cover" sizes="50vw" />
                      <div className="absolute right-2 top-2">
                        <span className="flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-xs text-white backdrop-blur-sm">
                          <PlatformIcon platform={v.platform} className="size-3" />
                          {compactNumber(v.views)}
                        </span>
                      </div>
                    </div>
                    <CardContent>
                      <p className="text-sm font-medium">{v.title}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="assets" className="pt-2">
              <Card>
                <CardHeader>
                  <CardTitle>Brand assets</CardTitle>
                  <CardDescription>Download approved footage, logos, and guidelines.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  {campaign.assets.map((a) => {
                    const Icon = assetIcon[a.type] ?? FileText
                    return (
                      <div key={a.name} className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 items-center justify-center rounded-md bg-muted">
                            <Icon className="size-4 text-muted-foreground" />
                          </span>
                          <div>
                            <p className="text-sm font-medium">{a.name}</p>
                            <p className="text-xs text-muted-foreground">{a.size}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" aria-label={`Download ${a.name}`}>
                          <Download />
                        </Button>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex flex-col gap-4 lg:sticky lg:top-20 lg:self-start">
          <Card>
            <CardContent className="flex flex-col gap-4 p-5">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-semibold text-primary">{formatMoney(campaign.ratePerMillion)}</span>
                <span className="text-sm text-muted-foreground">/ million views</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Budget spent</span>
                  <span className="font-medium">{spentPct}%</span>
                </div>
                <Progress value={spentPct} />
                <p className="text-xs text-muted-foreground">
                  {formatMoney(remaining, { compact: true })} of {formatMoney(campaign.budget, { compact: true })} remaining
                </p>
              </div>

              <Button size="lg" onClick={() => navigate("submit", { id: campaign.id })}>
                <Send data-icon="inline-start" />
                Submit a video
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col gap-3 p-5 text-sm">
              <Detail label="Platforms">
                <div className="flex items-center gap-1.5">
                  {campaign.platforms.map((p) => (
                    <span key={p} className="flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-xs">
                      <PlatformIcon platform={p} className="size-3" />
                      {platformLabel(p)}
                    </span>
                  ))}
                </div>
              </Detail>
              <Separator />
              <Detail label="Max per video">{formatMoney(campaign.maxPayoutPerVideo)}</Detail>
              <Detail label="Max per account">{formatMoney(campaign.maxPayoutPerAccount)}</Detail>
              <Detail label="Max submissions">{campaign.maxSubmissionsPerAccount} per account</Detail>
              <Separator />
              <Detail label="Min views to credit">
                <span className="flex items-center gap-1">
                  <Eye className="size-3.5" />
                  {formatNumber(campaign.minViews)}
                </span>
              </Detail>
              <Detail label="Duration">
                <span className="flex items-center gap-1">
                  <Clock className="size-3.5" />
                  {campaign.minDuration}&ndash;{campaign.maxDuration}s
                </span>
              </Detail>
              <Detail label="Languages">{campaign.languages.join(", ")}</Detail>
              <Detail label="Countries">
                <span className="flex items-center gap-1">
                  <Globe className="size-3.5" />
                  {campaign.countries.length > 2 ? `${campaign.countries.length} regions` : campaign.countries.join(", ")}
                </span>
              </Detail>
              <Separator />
              <Detail label="Required CTA">
                <Badge variant="secondary">{campaign.requiredCta}</Badge>
              </Detail>
              {campaign.requiredAudio && <Detail label="Audio">{campaign.requiredAudio}</Detail>}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {campaign.hashtags.map((h) => (
                  <span key={h} className="text-xs text-primary">{h}</span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{children}</span>
    </div>
  )
}
