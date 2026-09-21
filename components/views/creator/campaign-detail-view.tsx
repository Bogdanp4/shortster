"use client"

import Image from "next/image"
import { useApp } from "@/components/app/app-provider"
import { useT } from "@/components/i18n/locale-provider"
 import { getCampaign } from "@/lib/mock-data"
 import type { VideoLanguage } from "@/lib/types"
import { formatMoney, formatNumber, compactNumber, percent, formatRelative, categoryLabel } from "@/lib/format"
import { buildRequirementsChecklist } from "@/lib/domain/requirements"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { CampaignStatusBadge, SubmissionStatusBadge } from "@/components/shared/status-badge"
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
  const { params, navigate, submissions } = useApp()
  const t = useT()
  const campaign = getCampaign(params.id)
  const mySubmissions = submissions.filter((s) => s.campaignId === params.id)
  const requirementsChecklist = campaign ? buildRequirementsChecklist(campaign.requirements, t) : []
  const languageLabels: Record<VideoLanguage, string> = {
    any: t("enums.videoLanguage.any"),
    en: t("enums.videoLanguage.en"),
    ru: t("enums.videoLanguage.ru"),
    uk: t("enums.videoLanguage.uk"),
  }

  if (!campaign) {
    return (
      <div className="flex flex-col gap-4">
        <Button variant="ghost" onClick={() => navigate("discover")} className="w-fit">
          <ArrowLeft data-icon="inline-start" />
          {t("campaignDetail.backToDiscover")}
        </Button>
        <p className="text-muted-foreground">{t("campaignDetail.notFound")}</p>
      </div>
    )
  }

  const spentPct = percent(campaign.creatorBudgetSpentMinor, campaign.creatorBudgetMinor)
  const remaining = campaign.creatorBudgetMinor - campaign.creatorBudgetSpentMinor

  return (
    <div className="flex flex-col gap-6">
      <Button variant="ghost" onClick={() => navigate("discover")} className="w-fit">
        <ArrowLeft data-icon="inline-start" />
        {t("campaignDetail.backToDiscover")}
      </Button>

      <div className="relative overflow-hidden rounded-xl border border-border/60">
        <div className="relative aspect-[21/9] w-full">
          <Image src={campaign.cover || "/placeholder.svg"} alt={`${campaign.title} cover`} fill className="object-cover" priority sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-5 lg:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{categoryLabel[campaign.category]}</Badge>
            <CampaignStatusBadge status={campaign.status} />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight lg:text-4xl">{campaign.title}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <BrandAvatar name={campaign.brand} className="size-6" />
              <span className="text-sm">{t("campaignDetail.by", { brand: campaign.brand })}</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-muted-foreground">{t("campaignDetail.availableOn")}</span>
              {campaign.platforms.map((p) => (
                <span
                  key={p}
                  className="flex items-center gap-1 rounded-md bg-background/70 px-2 py-0.5 text-xs backdrop-blur"
                >
                  <PlatformIcon platform={p} className="size-3" />
                  {platformLabel(p)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-6">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">{t("campaignDetail.tabOverview")}</TabsTrigger>
              <TabsTrigger value="requirements">{t("campaignDetail.tabRequirements")}</TabsTrigger>
              <TabsTrigger value="examples">{t("campaignDetail.tabExamples")}</TabsTrigger>
              <TabsTrigger value="assets">{t("campaignDetail.tabAssets")}</TabsTrigger>
              <TabsTrigger value="submissions">
                {t("campaignDetail.tabSubmissions")}{mySubmissions.length > 0 ? ` (${mySubmissions.length})` : ""}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="flex flex-col gap-6 pt-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t("campaignDetail.about")}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">{campaign.description}</p>
                  <Separator />
                  <div>
                    <h4 className="mb-3 text-sm font-medium">{t("campaignDetail.instructions")}</h4>
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
                <AlertTitle>{t("campaignDetail.howPaidTitle")}</AlertTitle>
                <AlertDescription>
                  {t("campaignDetail.howPaidBody", {
                    rate: formatMoney(campaign.ratePerMillionMinor),
                    maxVideo: formatMoney(campaign.maxPayoutPerVideoMinor),
                    maxAccount: formatMoney(campaign.maxPayoutPerAccountMinor),
                    minViews: formatNumber(campaign.requirements.minViews),
                  })}
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="requirements" className="pt-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t("campaignDetail.requirementsTitle")}</CardTitle>
                  <CardDescription>{t("campaignDetail.requirementsDescription")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="grid gap-2.5 sm:grid-cols-2">
                    {requirementsChecklist.map((req) => (
                      <li key={req.key} className="flex items-start gap-2.5 rounded-lg border border-border/60 p-3 text-sm">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                        {req.label}
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

            <TabsContent value="submissions" className="pt-2">
              {mySubmissions.length === 0 ? (
                <Empty>
                  <EmptyHeader>
                    <Send className="size-8 text-muted-foreground" />
                    <EmptyTitle>{t("campaignDetail.noSubmissionsTitle")}</EmptyTitle>
                    <EmptyDescription>
                      {t("campaignDetail.noSubmissionsBody")}
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <div className="flex flex-col gap-3">
                  {mySubmissions.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => navigate("submission", { id: s.id })}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border/60 p-3 text-left transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 items-center justify-center rounded-md bg-muted">
                          <PlatformIcon platform={s.platform} className="size-4" />
                        </span>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{s.accountHandle}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatNumber(s.viewsAtSubmission)} {t("campaignDetail.views")} · {formatRelative(s.submittedAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium tabular-nums">
                          {formatMoney(s.finalRewardMinor ?? s.calculatedRewardMinor)}
                        </span>
                        <SubmissionStatusBadge status={s.status} />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="assets" className="pt-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t("campaignDetail.assetsTitle")}</CardTitle>
                  <CardDescription>{t("campaignDetail.assetsDescription")}</CardDescription>
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
                <span className="text-3xl font-semibold text-primary">{formatMoney(campaign.ratePerMillionMinor)}</span>
                <span className="text-sm text-muted-foreground">{t("campaignDetail.perMillionViews")}</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{t("campaignDetail.budgetSpent")}</span>
                  <span className="font-medium">{spentPct}%</span>
                </div>
                <Progress value={spentPct} />
                <p className="text-xs text-muted-foreground">
                  {t("campaignDetail.remaining", {
                    remaining: formatMoney(remaining, { compact: true }),
                    budget: formatMoney(campaign.creatorBudgetMinor, { compact: true }),
                  })}
                </p>
              </div>

              {campaign.status === "active" ? (
                <Button size="lg" onClick={() => navigate("submit", { id: campaign.id })}>
                  <Send data-icon="inline-start" />
                  {t("campaignDetail.submitVideo")}
                </Button>
              ) : (
                <Button size="lg" disabled>
                  <Send data-icon="inline-start" />
                  {campaign.status === "paused" ? t("campaignDetail.campaignPaused") : t("campaignDetail.notAccepting")}
                </Button>
              )}
              {campaign.status === "paused" && (
                <p className="text-xs text-muted-foreground">
                  {t("campaignDetail.pausedNote")}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col gap-3 p-5 text-sm">
              <Detail label={t("campaignDetail.platforms")}>
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
                <Detail label={t("campaignDetail.maxPerVideo")}>{formatMoney(campaign.maxPayoutPerVideoMinor)}</Detail>
                <Detail label={t("campaignDetail.maxPerAccount")}>{formatMoney(campaign.maxPayoutPerAccountMinor)}</Detail>
              <Detail label={t("campaignDetail.maxSubmissions")}>{t("campaignDetail.perAccount", { count: campaign.maxSubmissionsPerAccount })}</Detail>
              <Separator />
              <Detail label={t("campaignDetail.minViewsToCredit")}>
                <span className="flex items-center gap-1">
                  <Eye className="size-3.5" />
                  {formatNumber(campaign.requirements.minViews)}
                </span>
              </Detail>
              <Detail label={t("campaignDetail.duration")}>
                <span className="flex items-center gap-1">
                  <Clock className="size-3.5" />
                  {campaign.requirements.minVideoDurationSeconds}&ndash;{campaign.requirements.maxVideoDurationSeconds}s
                </span>
              </Detail>
              <Detail label={t("campaignDetail.languages")}>{languageLabels[campaign.requirements.videoLanguage]}</Detail>
              <Detail label={t("campaignDetail.countries")}>
                <span className="flex items-center gap-1">
                  <Globe className="size-3.5" />
                  {campaign.countries.length > 2 ? t("campaignDetail.regions", { count: campaign.countries.length }) : campaign.countries.join(", ")}
                </span>
              </Detail>
              <Separator />
              <Detail label={t("campaignDetail.requiredCta")}>
                <Badge variant="secondary">{campaign.requiredCta}</Badge>
              </Detail>
              {campaign.requiredAudio && <Detail label={t("campaignDetail.audio")}>{campaign.requiredAudio}</Detail>}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {campaign.optionalHashtags.map((h) => (
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
