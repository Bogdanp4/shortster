"use client"

import { useMemo, useRef, useState } from "react"
import Image from "next/image"
import {
  Upload,
  CheckCircle2,
  Loader2,
  XCircle,
  Lock,
  ShieldCheck,
  Eye,
  Heart,
  MessageCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  ImagePlus,
  X,
  Zap,
  PencilLine,
} from "lucide-react"
import { toast } from "sonner"

import { useApp } from "@/components/app/app-provider"
import { useT } from "@/components/i18n/locale-provider"
import { getCampaign, resolveMockVideo } from "@/lib/mock-data"
import { formatMoney, formatNumber, detectPlatformFromUrl, platformUrlPlaceholder } from "@/lib/format"
import { calculateReward, calculateFinalReward } from "@/lib/domain/money"
import type {
  Platform,
  ResolvedVideo,
  VideoCheckOutcome,
  DuplicateInfo,
  Submission,
  MetricsSource,
} from "@/lib/types"
import { PageHeader } from "@/components/shared/page-header"
import { PlatformIcon, platformLabel } from "@/components/shared/platform-icon"
import { SubmissionStatusBadge } from "@/components/shared/status-badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field"
import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/ui/input-group"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty"
import { cn } from "@/lib/utils"

type Stage = "input" | "validating" | "failed" | "review"

interface CheckState {
  label: string
  status: "pending" | "running" | "passed" | "failed"
}

// Automatic accounts get a machine-read, locked view count. Manual accounts
// (e.g. Instagram personal) can't be read via API, so the last step is replaced
// by a creator declaration + proof upload reviewed by a moderator.
const AUTO_CHECKS = [
  "submit.checkFetching",
  "submit.checkConfirming",
  "submit.checkScanning",
  "submit.checkLocking",
]
const MANUAL_CHECKS = ["submit.checkFetching", "submit.checkConfirming", "submit.checkScanning"]

const MAX_PROOF = 3

function metricsSourceFor(platform: Platform, manual: boolean): MetricsSource {
  if (manual) return "manual_creator_proof"
  if (platform === "tiktok") return "tiktok_api"
  if (platform === "youtube") return "youtube_api"
  return "instagram_api"
}

export function SubmitView() {
  const { params, navigate, socialAccounts, addSubmission } = useApp()
  const t = useT()
  const campaign = getCampaign(params.id ?? "stake-highlights") ?? getCampaign("stake-highlights")!

  const eligibleAccounts = useMemo(
    () => socialAccounts.filter((a) => campaign.platforms.includes(a.platform) && a.status === "verified"),
    [socialAccounts, campaign],
  )

  const [accountId, setAccountId] = useState(eligibleAccounts[0]?.id ?? "")
  const [url, setUrl] = useState("")
  const [stage, setStage] = useState<Stage>("input")
  const [checks, setChecks] = useState<CheckState[]>([])
  const [failure, setFailure] = useState<{ outcome: VideoCheckOutcome; duplicate?: DuplicateInfo } | null>(null)
  const [video, setVideo] = useState<ResolvedVideo | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [claimedViews, setClaimedViews] = useState("")
  const [proofFiles, setProofFiles] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const account = eligibleAccounts.find((a) => a.id === accountId)
  const remaining = campaign.creatorBudgetMinor - campaign.creatorBudgetSpentMinor
  const manualMode = account?.metricsMode === "manual"

  // Group the campaign's allowed platforms with the creator's verified accounts
  // on each, so we can show one section per platform (with a connect CTA when
  // the creator has no verified account there).
  const platformGroups = useMemo(
    () =>
      campaign.platforms.map((platform) => ({
        platform,
        accounts: eligibleAccounts.filter((a) => a.platform === platform),
      })),
    [campaign.platforms, eligibleAccounts],
  )

  const connectLabel: Record<Platform, string> = {
    tiktok: t("submit.connectTiktok"),
    instagram: t("submit.connectInstagram"),
    youtube: t("submit.connectYoutube"),
  }

  // Warn when the pasted URL is clearly from a different platform than the
  // selected account (e.g. TikTok account but an Instagram link).
  const urlPlatform = detectPlatformFromUrl(url)
  const mismatch = !!(account && urlPlatform && urlPlatform !== account.platform)

  // Views used for the payout estimate: creator-declared in manual mode,
  // machine-locked in automatic mode.
  const claimedViewsNum = Number(claimedViews) || 0
  const effectiveViews = manualMode ? claimedViewsNum : (video?.views ?? 0)
  const payout =
    video && effectiveViews > 0
      ? (() => {
          const rawRewardMinor = calculateReward({
            views: effectiveViews,
            ratePerMillionMinor: campaign.ratePerMillionMinor,
          })
          const { finalRewardMinor, limitReason } = calculateFinalReward({
            rawRewardMinor,
            maxPayoutPerVideoMinor: campaign.maxPayoutPerVideoMinor,
            remainingBudgetMinor: remaining,
          })
          return { rawRewardMinor, finalRewardMinor, limitReason }
        })()
      : null

  const durationOk = video ? video.duration >= campaign.req.minDuration && video.duration <= campaign.req.maxDuration : true

  // Manual submissions need a declared view count and at least one proof screenshot.
  const manualReady = !manualMode || (claimedViewsNum > 0 && proofFiles.length > 0)
  const canSubmit = stage === "review" && !!video && confirmed && durationOk && manualReady && !submitting

  async function runValidation() {
    if (!url.trim()) {
      toast.error(t("submit.errAddUrlTitle"), { description: t("submit.errAddUrlBody") })
      return
    }
    if (!account) {
      toast.error(t("submit.errSelectAccount"))
      return
    }

    setStage("validating")
    setVideo(null)
    setFailure(null)
    setConfirmed(false)
    setClaimedViews("")
    setProofFiles([])

    const labels = manualMode ? MANUAL_CHECKS : AUTO_CHECKS
    setChecks(labels.map((label) => ({ label, status: "pending" })))

    const result = resolveMockVideo(url, { handle: account.handle, platform: account.platform })

    // Walk the checks one at a time with a short delay so the flow reads as real work.
    for (let i = 0; i < labels.length; i++) {
      setChecks((prev) => prev.map((c, idx) => (idx === i ? { ...c, status: "running" } : c)))
      await wait(620)

      // Determine whether this specific check fails.
      let failsHere = false
      if (i === 0 && (result.outcome === "not_found" || result.outcome === "private")) failsHere = true
      if (i === 1 && result.outcome === "wrong_account") failsHere = true
      if (i === 2 && result.outcome === "duplicate") failsHere = true

      if (failsHere) {
        setChecks((prev) => prev.map((c, idx) => (idx === i ? { ...c, status: "failed" } : c)))
        setFailure({ outcome: result.outcome, duplicate: result.duplicate })
        await wait(400)
        setStage("failed")
        return
      }

      setChecks((prev) => prev.map((c, idx) => (idx === i ? { ...c, status: "passed" } : c)))
    }

    await wait(300)
    setVideo(result.video ?? null)
    setStage("review")
  }

  function addProof(files: FileList | null) {
    if (!files || files.length === 0) return
    const names = Array.from(files).map((f) => f.name)
    setProofFiles((prev) => [...prev, ...names].slice(0, MAX_PROOF))
  }

  function finalize() {
    if (!video || !account || !payout) return
    setSubmitting(true)
    setTimeout(() => {
      const submission: Submission = {
        id: `sub-${Date.now().toString().slice(-5)}`,
        campaignId: campaign.id,
        campaignTitle: campaign.title,
        brand: campaign.brand,
        cover: campaign.cover,
        platform: account.platform,
        accountHandle: account.handle,
        creatorName: "Alex Rivera",
        creatorHandle: "@shortster",
        videoUrl: url,
        videoId: video.videoId,
        thumb: video.thumb,
        viewsAtSubmission: effectiveViews,
        likes: video.likes,
        comments: video.comments,
        duration: video.duration,
        ratePerMillionMinor: campaign.ratePerMillionMinor,
        calculatedRewardMinor: payout.rawRewardMinor,
        finalRewardMinor: payout.limitReason ? payout.finalRewardMinor : undefined,
        status: "pending",
        submittedAt: "Just now",
        lockedAt: manualMode ? undefined : "Just now",
        riskScore: manualMode ? 22 : 8,
        metricsMode: manualMode ? "manual" : "automatic",
        metricsSource: metricsSourceFor(account.platform, manualMode),
        claimedViews: manualMode ? claimedViewsNum : undefined,
        followersAtSubmission: account.followers,
        proofAssets: manualMode ? proofFiles : undefined,
      }
      addSubmission(submission)
      toast.success(manualMode ? t("submit.toastManualTitle") : t("submit.toastAutoTitle"), {
        description: manualMode
          ? t("submit.toastManualBody", { campaign: campaign.title, views: formatNumber(claimedViewsNum) })
          : t("submit.toastAutoBody", { campaign: campaign.title, views: formatNumber(video.views) }),
      })
      navigate("submissions")
    }, 900)
  }

  // No eligible accounts — guide the creator to connect one.
  if (eligibleAccounts.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title={t("submit.title")}
          description={t("submit.description", { campaign: campaign.title, brand: campaign.brand })}
          backLabel={t("submit.backLabel")}
          onBack={() => navigate("campaign", { id: campaign.id })}
        />
        <Empty className="rounded-xl border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ShieldCheck />
            </EmptyMedia>
            <EmptyTitle>{t("submit.emptyTitle")}</EmptyTitle>
            <EmptyDescription>
              {t("submit.emptyDescription", { platforms: campaign.platforms.map(platformLabel).join(", ") })}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => navigate("social")}>
              {t("submit.connectAccount")}
              <ArrowRight data-icon="inline-end" />
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("submit.title")}
        description={t("submit.description", { campaign: campaign.title, brand: campaign.brand })}
        backLabel={t("submit.backLabel")}
        onBack={() => navigate("campaign", { id: campaign.id })}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Step 1 — choose platform & account */}
          <Card>
            <CardHeader>
              <CardTitle>{t("submit.step1Title")}</CardTitle>
              <CardDescription>
                {t("submit.step1Desc", { platforms: campaign.platforms.map(platformLabel).join(", ") })}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {platformGroups.map(({ platform, accounts }) => (
                <div key={platform} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <PlatformIcon platform={platform} className="size-4" />
                    <span className="text-sm font-medium">{platformLabel(platform)}</span>
                  </div>
                  {accounts.length > 0 ? (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {accounts.map((a) => {
                        const active = a.id === accountId
                        return (
                          <button
                            key={a.id}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            disabled={stage === "validating"}
                            onClick={() => {
                              setAccountId(a.id)
                              if (stage !== "input") setStage("input")
                            }}
                            className={cn(
                              "flex items-center gap-3 rounded-lg border p-3 text-left transition-colors disabled:opacity-60",
                              active
                                ? "border-primary bg-primary/5 ring-1 ring-primary"
                                : "border-border hover:border-primary/40 hover:bg-muted/40",
                            )}
                          >
                            <span
                              className={cn(
                                "flex size-4 shrink-0 items-center justify-center rounded-full border",
                                active ? "border-primary" : "border-muted-foreground/40",
                              )}
                            >
                              {active && <span className="size-2 rounded-full bg-primary" />}
                            </span>
                            <div className="flex min-w-0 flex-1 flex-col">
                              <span className="truncate text-sm font-medium">{a.handle}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatNumber(a.followers)} {t("submit.followersSuffix")}
                              </span>
                            </div>
                            <Badge
                              variant="secondary"
                              className={cn("gap-1", a.metricsMode === "manual" ? "text-warning" : "text-success")}
                            >
                              {a.metricsMode === "manual" ? (
                                <PencilLine className="size-3" />
                              ) : (
                                <Zap className="size-3" />
                              )}
                              {a.metricsMode === "manual" ? t("submit.badgeManual") : t("submit.badgeAuto")}
                            </Badge>
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-start gap-2 rounded-lg border border-dashed p-3 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-sm text-muted-foreground">
                        {t("submit.noVerifiedAccount", { platform: platformLabel(platform) })}
                      </span>
                      <Button variant="outline" size="sm" onClick={() => navigate("social")}>
                        {connectLabel[platform]}
                        <ArrowRight data-icon="inline-end" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}

              {account && (
                <Alert variant={manualMode ? "default" : "default"}>
                  {manualMode ? <PencilLine className="size-4" /> : <Zap className="size-4" />}
                  <AlertTitle>
                    {manualMode ? t("submit.manualAccountTitle") : t("submit.autoAccountTitle")}
                  </AlertTitle>
                  <AlertDescription>
                    {manualMode ? t("submit.manualAccountDesc") : t("submit.autoAccountDesc")}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Step 2 — video link */}
          <Card>
            <CardHeader>
              <CardTitle>{t("submit.step2Title")}</CardTitle>
              <CardDescription>
                {manualMode ? t("submit.step2DescManual") : t("submit.step2DescAuto")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="url">{t("submit.videoUrl")}</FieldLabel>
                  <InputGroup>
                    {account && (
                      <InputGroupAddon>
                        <PlatformIcon platform={account.platform} className="size-4" />
                      </InputGroupAddon>
                    )}
                    <InputGroupInput
                      id="url"
                      placeholder={account ? platformUrlPlaceholder[account.platform] : t("submit.urlPlaceholderFallback")}
                      value={url}
                      onChange={(e) => {
                        setUrl(e.target.value)
                        if (stage !== "input") setStage("input")
                      }}
                    />
                  </InputGroup>
                  <FieldDescription>
                    {account
                      ? t("submit.urlHelp", { platform: platformLabel(account.platform), handle: account.handle })
                      : t("submit.urlHelpNoAccount")}
                  </FieldDescription>
                </Field>
              </FieldGroup>

              {mismatch && account && urlPlatform && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTriangle />
                  <AlertTitle>{t("submit.mismatchTitle")}</AlertTitle>
                  <AlertDescription className="flex flex-col gap-3">
                    <span>
                      {t("submit.mismatchBody", {
                        account: platformLabel(account.platform),
                        url: platformLabel(urlPlatform),
                      })}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {platformGroups.find((g) => g.platform === urlPlatform)?.accounts.length ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const match = eligibleAccounts.find((a) => a.platform === urlPlatform)
                            if (match) setAccountId(match.id)
                          }}
                        >
                          {t("submit.switchTo", { platform: platformLabel(urlPlatform) })}
                        </Button>
                      ) : null}
                      <Button size="sm" variant="ghost" onClick={() => setUrl("")}>
                        {t("submit.useAnother")}
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {stage === "input" && (
                <Button className="mt-4" onClick={runValidation} disabled={!account || !url.trim() || mismatch}>
                  {t("submit.validateVideo")}
                  <ArrowRight data-icon="inline-end" />
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Step 3 — validation progress */}
          {(stage === "validating" || stage === "failed" || stage === "review") && (
            <Card>
              <CardHeader>
                <CardTitle>{t("submit.step3Title")}</CardTitle>
                <CardDescription>
                  {manualMode ? t("submit.step3DescManual") : t("submit.step3DescAuto")}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {checks.map((c) => (
                  <div key={c.label} className="flex items-center gap-3 text-sm">
                    <CheckIcon status={c.status} />
                    <span
                      className={
                        c.status === "failed"
                          ? "text-destructive"
                          : c.status === "passed"
                            ? "text-foreground"
                            : "text-muted-foreground"
                      }
                    >
                      {c.label}
                    </span>
                  </div>
                ))}

                {stage === "failed" && failure && (
                  <FailureAlert
                    failure={failure}
                    onRetry={() => setStage("input")}
                    onOpenSubmissions={() => navigate("submissions")}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 4 — locked snapshot (auto) OR declared views + proof (manual) */}
          {stage === "review" && video && (
            <>
              {manualMode ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PencilLine className="size-4 text-warning" />
                      {t("submit.step4ManualTitle")}
                    </CardTitle>
                    <CardDescription>{t("submit.step4ManualDesc")}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <div className="flex gap-4">
                      <div className="relative aspect-[9/16] w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                        <Image
                          src={video.thumb || "/placeholder.svg"}
                          alt={t("submit.thumbnailAlt")}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      </div>
                      <div className="flex flex-1 flex-col gap-3">
                        <div className="flex items-center gap-2 text-sm">
                          <PlatformIcon platform={video.platform} className="size-4" />
                          <span className="font-medium">{video.authorHandle}</span>
                          <span className="text-muted-foreground">· {video.publishedAt}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <Snapshot icon={Heart} label={t("metric.likes")} value={formatNumber(video.likes)} />
                          <Snapshot icon={MessageCircle} label={t("metric.comments")} value={formatNumber(video.comments)} />
                          <Snapshot
                            icon={Clock}
                            label={t("metric.duration")}
                            value={`${video.duration}s`}
                            tone={durationOk ? "default" : "danger"}
                          />
                        </div>
                      </div>
                    </div>

                    <Field>
                      <FieldLabel htmlFor="claimed">{t("submit.declaredViews")}</FieldLabel>
                      <InputGroup>
                        <InputGroupAddon>
                          <Eye className="size-4" />
                        </InputGroupAddon>
                        <InputGroupInput
                          id="claimed"
                          inputMode="numeric"
                          placeholder={t("submit.declaredPlaceholder")}
                          value={claimedViews}
                          onChange={(e) => setClaimedViews(e.target.value.replace(/[^0-9]/g, ""))}
                        />
                      </InputGroup>
                      <FieldDescription>
                        {claimedViewsNum > 0
                          ? t("submit.declaredHelpWith", { views: formatNumber(claimedViewsNum) })
                          : t("submit.declaredHelpEmpty")}
                      </FieldDescription>
                    </Field>

                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-medium">{t("submit.proofScreenshots")}</span>
                      <div className="flex flex-wrap gap-2">
                        {proofFiles.map((name, i) => (
                          <span
                            key={`${name}-${i}`}
                            className="flex items-center gap-2 rounded-md border bg-muted/40 px-2 py-1 text-xs"
                          >
                            <ImagePlus className="size-3.5 text-muted-foreground" />
                            <span className="max-w-32 truncate">{name}</span>
                            <button
                              type="button"
                              aria-label={`Remove ${name}`}
                              onClick={() => setProofFiles((prev) => prev.filter((_, idx) => idx !== i))}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <X className="size-3.5" />
                            </button>
                          </span>
                        ))}
                        {proofFiles.length < MAX_PROOF && (
                          <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                            <ImagePlus data-icon="inline-start" />
                            {t("common.addScreenshot")}
                          </Button>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="sr-only"
                        onChange={(e) => {
                          addProof(e.target.files)
                          e.target.value = ""
                        }}
                      />
                      <FieldDescription>{t("submit.proofHelp", { max: MAX_PROOF })}</FieldDescription>
                    </div>

                    {!durationOk && (
                      <Alert variant="destructive">
                        <AlertTriangle />
                        <AlertTitle>{t("submit.durationOutOfRangeTitle")}</AlertTitle>
                        <AlertDescription>
                          {t("submit.durationOutOfRangeBodyManual", {
                            min: campaign.req.minDuration,
                            max: campaign.req.maxDuration,
                            duration: video.duration,
                          })}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="size-4 text-primary" />
                      {t("submit.step4LockedTitle")}
                    </CardTitle>
                    <CardDescription>{t("submit.step4LockedDesc")}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <div className="flex gap-4">
                      <div className="relative aspect-[9/16] w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                        <Image
                          src={video.thumb || "/placeholder.svg"}
                          alt={t("submit.thumbnailAlt")}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      </div>
                      <div className="flex flex-1 flex-col gap-3">
                        <div className="flex items-center gap-2 text-sm">
                          <PlatformIcon platform={video.platform} className="size-4" />
                          <span className="font-medium">{video.authorHandle}</span>
                          <span className="text-muted-foreground">· {video.publishedAt}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          <Snapshot icon={Eye} label={t("metric.views")} value={formatNumber(video.views)} />
                          <Snapshot icon={Heart} label={t("metric.likes")} value={formatNumber(video.likes)} />
                          <Snapshot icon={MessageCircle} label={t("metric.comments")} value={formatNumber(video.comments)} />
                          <Snapshot
                            icon={Clock}
                            label={t("metric.duration")}
                            value={`${video.duration}s`}
                            tone={durationOk ? "default" : "danger"}
                          />
                        </div>
                      </div>
                    </div>

                    {!durationOk && (
                      <Alert variant="destructive">
                        <AlertTriangle />
                        <AlertTitle>{t("submit.durationOutOfRangeTitle")}</AlertTitle>
                        <AlertDescription>
                          {t("submit.durationOutOfRangeBodyAuto", {
                            min: campaign.req.minDuration,
                            max: campaign.req.maxDuration,
                            duration: video.duration,
                          })}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>{t("submit.step5Title")}</CardTitle>
                  <CardDescription>{t("submit.step5Desc")}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {campaign.requirements.map((r) => (
                    <div key={r} className="flex items-start gap-3 text-sm">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span className="text-muted-foreground">{r}</span>
                    </div>
                  ))}
                  <Separator />
                  <label className="flex items-start gap-3 text-sm">
                    <Checkbox checked={confirmed} onCheckedChange={(v) => setConfirmed(v === true)} className="mt-0.5" />
                    <span>
                      {t("submit.confirmLead", { cta: campaign.requiredCta ? ` "${campaign.requiredCta}"` : "" })}
                      <span className="font-medium text-foreground">{account?.handle}</span>
                      {manualMode ? t("submit.confirmTrailingManual") : t("submit.confirmTrailingAuto")}
                    </span>
                  </label>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Sticky payout summary */}
        <div className="flex flex-col gap-6 lg:sticky lg:top-20 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle>{t("submit.payoutTitle")}</CardTitle>
              <CardDescription>
                {payout
                  ? manualMode
                    ? t("submit.payoutDescManual")
                    : t("submit.payoutDescAuto")
                  : t("submit.payoutDescDefault")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Row label={t("submit.rowRate")}>{formatMoney(campaign.ratePerMillionMinor)} {t("submit.ratePerMillionSuffix")}</Row>
              <Row label={t("submit.rowMinViews")}>{formatNumber(campaign.req.minViews)}</Row>
              <Row label={t("submit.rowMaxPerVideo")}>{formatMoney(campaign.maxPayoutPerVideoMinor)}</Row>
              <Row label={t("submit.rowBudgetRemaining")}>{formatMoney(remaining, { compact: true })}</Row>

              {payout && video ? (
                <>
                  <Separator />
                  <Row label={t("submit.rowRaw", { views: formatNumber(effectiveViews) })}>{formatMoney(payout.rawRewardMinor)}</Row>
                  {payout.limitReason === "per_video" && (
                    <Row label={t("submit.rowPerVideoCap")} tone="warning">
                      &minus;{formatMoney(payout.rawRewardMinor - payout.finalRewardMinor)}
                    </Row>
                  )}
                  {payout.limitReason === "budget" && (
                    <Row label={t("submit.rowLimitedByBudget")} tone="warning">
                      &minus;{formatMoney(payout.rawRewardMinor - payout.finalRewardMinor)}
                    </Row>
                  )}
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {manualMode ? t("submit.estPending") : t("submit.youllEarn")}
                    </span>
                    <span className="text-2xl font-bold text-primary tabular-nums">
                      {formatMoney(payout.finalRewardMinor)}
                    </span>
                  </div>
                  {manualMode && (
                    <p className="text-xs text-muted-foreground">{t("submit.manualFinalNote")}</p>
                  )}
                  {!manualMode && payout.limitReason && (
                    <p className="text-xs text-muted-foreground">
                      {payout.limitReason === "per_video"
                        ? t("submit.capNotePerVideo", { amount: formatMoney(campaign.maxPayoutPerVideoMinor) })
                        : t("submit.capNoteBudget", { amount: formatMoney(remaining) })}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {manualMode && stage === "review" ? t("submit.enterViewsToEstimate") : t("submit.exampleAt500k")}
                    </span>
                    {!(manualMode && stage === "review") && (
                      <span className="text-lg font-semibold text-primary tabular-nums">
                        {formatMoney(Math.round((500000 / 1_000_000) * campaign.ratePerMillionMinor))}
                      </span>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {stage === "review" && video && (
            <Button size="lg" disabled={!canSubmit} onClick={finalize}>
              {submitting ? (
                <Loader2 className="animate-spin" data-icon="inline-start" />
              ) : (
                <Upload data-icon="inline-start" />
              )}
              {submitting ? t("submit.submitting") : manualMode ? t("submit.submitManual") : t("submit.submitAuto")}
            </Button>
          )}

          <Alert>
            <ShieldCheck />
            <AlertTitle>{manualMode ? t("submit.lockAlertManualTitle") : t("submit.lockAlertAutoTitle")}</AlertTitle>
            <AlertDescription>
              {manualMode ? t("submit.lockAlertManualBody") : t("submit.lockAlertAutoBody")}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  )
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function CheckIcon({ status }: { status: CheckState["status"] }) {
  if (status === "running") return <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
  if (status === "passed") return <CheckCircle2 className="size-4 shrink-0 text-success" />
  if (status === "failed") return <XCircle className="size-4 shrink-0 text-destructive" />
  return <span className="size-4 shrink-0 rounded-full border border-muted-foreground/30" />
}

function Snapshot({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: typeof Eye
  label: string
  value: string
  tone?: "default" | "danger"
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="size-3.5" />
        <span className="text-xs">{label}</span>
      </div>
      <span className={`text-base font-semibold tabular-nums ${tone === "danger" ? "text-destructive" : ""}`}>
        {value}
      </span>
    </div>
  )
}

function Row({
  label,
  children,
  tone = "default",
}: {
  label: string
  children: React.ReactNode
  tone?: "default" | "warning"
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-medium tabular-nums ${tone === "warning" ? "text-warning" : ""}`}>{children}</span>
    </div>
  )
}

function FailureAlert({
  failure,
  onRetry,
  onOpenSubmissions,
}: {
  failure: { outcome: VideoCheckOutcome; duplicate?: DuplicateInfo }
  onRetry: () => void
  onOpenSubmissions: () => void
}) {
  const t = useT()
  const copy: Record<VideoCheckOutcome, { title: string; body: React.ReactNode }> = {
    valid: { title: "", body: null },
    not_found: {
      title: t("submit.outcomeNotFoundTitle"),
      body: t("submit.outcomeNotFoundBody"),
    },
    private: {
      title: t("submit.outcomePrivateTitle"),
      body: t("submit.outcomePrivateBody"),
    },
    wrong_account: {
      title: t("submit.outcomeWrongAccountTitle"),
      body: t("submit.outcomeWrongAccountBody"),
    },
    duplicate: {
      title: t("submit.outcomeDuplicateTitle"),
      body: failure.duplicate ? (
        <span className="flex flex-col gap-2">
          <span>
            {t("submit.outcomeDuplicateBody", {
              campaign: failure.duplicate.campaignTitle,
              date: failure.duplicate.submittedAt,
            })}
          </span>
          <span className="flex items-center gap-2">
            <span className="text-xs">{t("submit.outcomeDuplicateExistingStatus")}</span>
            <SubmissionStatusBadge status={failure.duplicate.status} />
          </span>
        </span>
      ) : (
        t("submit.outcomeDuplicateFallback")
      ),
    },
  }
  const c = copy[failure.outcome]
  return (
    <Alert variant="destructive" className="mt-1">
      <XCircle />
      <AlertTitle>{c.title}</AlertTitle>
      <AlertDescription className="flex flex-col gap-3">
        {c.body}
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onRetry}>
            {t("submit.tryAnotherLink")}
          </Button>
          {failure.outcome === "duplicate" && (
            <Button size="sm" variant="ghost" onClick={onOpenSubmissions}>
              {t("submit.viewMySubmissions")}
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  )
}
