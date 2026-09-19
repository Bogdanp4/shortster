"use client"

import { useMemo, useState } from "react"
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
} from "lucide-react"
import { toast } from "sonner"

import { useApp } from "@/components/app/app-provider"
import { getCampaign, resolveMockVideo } from "@/lib/mock-data"
import { formatMoney, formatNumber, calcPayout, detectPlatformFromUrl, platformUrlPlaceholder } from "@/lib/format"
import type { Platform, ResolvedVideo, VideoCheckOutcome, DuplicateInfo, Submission } from "@/lib/types"
import { PageHeader } from "@/components/shared/page-header"
import { PlatformIcon, platformLabel } from "@/components/shared/platform-icon"
import { SubmissionStatusBadge } from "@/components/shared/status-badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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

const CHECK_LABELS = ["Fetching video from platform", "Confirming account ownership", "Scanning for duplicates", "Locking verified view count"]

export function SubmitView() {
  const { params, navigate, socialAccounts, addSubmission } = useApp()
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

  const account = eligibleAccounts.find((a) => a.id === accountId)
  const remaining = campaign.budget - campaign.spent

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
    tiktok: "Connect TikTok",
    instagram: "Verify Instagram",
    youtube: "Connect YouTube",
  }

  // Warn when the pasted URL is clearly from a different platform than the
  // selected account (e.g. TikTok account but an Instagram link).
  const urlPlatform = detectPlatformFromUrl(url)
  const mismatch = !!(account && urlPlatform && urlPlatform !== account.platform)

  const payout = video ? calcPayout({
    views: video.views,
    ratePerMillion: campaign.ratePerMillion,
    maxPayoutPerVideo: campaign.maxPayoutPerVideo,
    remainingBudget: remaining,
  }) : null

  const durationOk = video ? video.duration >= campaign.minDuration && video.duration <= campaign.maxDuration : true

  async function runValidation() {
    if (!url.trim()) {
      toast.error("Add your video URL", { description: "Paste the public link to the video you posted." })
      return
    }
    if (!account) {
      toast.error("Select a posting account")
      return
    }

    setStage("validating")
    setVideo(null)
    setFailure(null)
    setConfirmed(false)

    const initial: CheckState[] = CHECK_LABELS.map((label) => ({ label, status: "pending" }))
    setChecks(initial)

    const result = resolveMockVideo(url, { handle: account.handle, platform: account.platform })

    // Walk the checks one at a time with a short delay so the flow reads as real work.
    for (let i = 0; i < CHECK_LABELS.length; i++) {
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
        viewsAtSubmission: video.views,
        likes: video.likes,
        comments: video.comments,
        duration: video.duration,
        ratePerMillion: campaign.ratePerMillion,
        reward: payout.rawReward,
        cappedReward: payout.limitReason ? payout.finalReward : undefined,
        status: "pending",
        submittedAt: "Just now",
        lockedAt: "Just now",
        riskScore: 8,
      }
      addSubmission(submission)
      toast.success("Submission received", {
        description: `${campaign.title} — view count locked at ${formatNumber(video.views)}. We'll notify you once reviewed.`,
      })
      navigate("submissions")
    }, 900)
  }

  // No eligible accounts — guide the creator to connect one.
  if (eligibleAccounts.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Submit a video"
          description={`Submitting to ${campaign.title} by ${campaign.brand}`}
          backLabel="Back to campaign"
          onBack={() => navigate("campaign", { id: campaign.id })}
        />
        <Empty className="rounded-xl border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ShieldCheck />
            </EmptyMedia>
            <EmptyTitle>No verified account for this campaign</EmptyTitle>
            <EmptyDescription>
              This campaign runs on {campaign.platforms.join(", ")}. Connect and verify an account on one of these
              platforms before submitting.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => navigate("social")}>
              Connect an account
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
        title="Submit a video"
        description={`Submitting to ${campaign.title} by ${campaign.brand}`}
        backLabel="Back to campaign"
        onBack={() => navigate("campaign", { id: campaign.id })}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Step 1 — choose platform & account */}
          <Card>
            <CardHeader>
              <CardTitle>1. Choose platform &amp; account</CardTitle>
              <CardDescription>
                This campaign runs on {campaign.platforms.map(platformLabel).join(", ")}. Pick the verified account you
                posted from.
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
                                {formatNumber(a.followers)} followers
                              </span>
                            </div>
                            <Badge variant="secondary" className="gap-1 text-success">
                              <ShieldCheck className="size-3" />
                              Verified
                            </Badge>
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-start gap-2 rounded-lg border border-dashed p-3 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-sm text-muted-foreground">
                        No verified {platformLabel(platform)} account.
                      </span>
                      <Button variant="outline" size="sm" onClick={() => navigate("social")}>
                        {connectLabel[platform]}
                        <ArrowRight data-icon="inline-end" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Step 2 — video link */}
          <Card>
            <CardHeader>
              <CardTitle>2. Video link</CardTitle>
              <CardDescription>
                Paste the link to your already-posted public video. We verify the view count directly from the
                platform — you can&apos;t edit it after submitting.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="url">Video URL</FieldLabel>
                  <InputGroup>
                    {account && (
                      <InputGroupAddon>
                        <PlatformIcon platform={account.platform} className="size-4" />
                      </InputGroupAddon>
                    )}
                    <InputGroupInput
                      id="url"
                      placeholder={account ? platformUrlPlaceholder[account.platform] : "Paste your video link"}
                      value={url}
                      onChange={(e) => {
                        setUrl(e.target.value)
                        if (stage !== "input") setStage("input")
                      }}
                    />
                  </InputGroup>
                  <FieldDescription>
                    {account
                      ? `Paste the ${platformLabel(account.platform)} link for ${account.handle}.`
                      : "Select a posting account above first."}
                  </FieldDescription>
                </Field>
              </FieldGroup>

              {mismatch && account && urlPlatform && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTriangle />
                  <AlertTitle>Platform mismatch</AlertTitle>
                  <AlertDescription className="flex flex-col gap-3">
                    <span>
                      You selected a {platformLabel(account.platform)} account but pasted a{" "}
                      {platformLabel(urlPlatform)} link. Choose the matching account or paste the correct link.
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
                          Switch to {platformLabel(urlPlatform)} account
                        </Button>
                      ) : null}
                      <Button size="sm" variant="ghost" onClick={() => setUrl("")}>
                        Use another video
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {stage === "input" && (
                <Button className="mt-4" onClick={runValidation} disabled={!account || !url.trim() || mismatch}>
                  Validate video
                  <ArrowRight data-icon="inline-end" />
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Step 2 — validation progress */}
          {(stage === "validating" || stage === "failed" || stage === "review") && (
            <Card>
              <CardHeader>
                <CardTitle>3. Verification</CardTitle>
                <CardDescription>Automated checks run before your submission is accepted.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {checks.map((c) => (
                  <div key={c.label} className="flex items-center gap-3 text-sm">
                    <CheckIcon status={c.status} />
                    <span className={c.status === "failed" ? "text-destructive" : c.status === "passed" ? "text-foreground" : "text-muted-foreground"}>
                      {c.label}
                    </span>
                  </div>
                ))}

                {stage === "failed" && failure && (
                  <FailureAlert failure={failure} onRetry={() => setStage("input")} onOpenSubmissions={() => navigate("submissions")} />
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 3 — locked snapshot + requirements confirmation */}
          {stage === "review" && video && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="size-4 text-primary" />
                    4. Locked view snapshot
                  </CardTitle>
                  <CardDescription>
                    This is the verified state we&apos;ll pay against. Later view growth does not change the reward.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex gap-4">
                    <div className="relative aspect-[9/16] w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                      <Image src={video.thumb || "/placeholder.svg"} alt="Video thumbnail" fill className="object-cover" sizes="96px" />
                    </div>
                    <div className="flex flex-1 flex-col gap-3">
                      <div className="flex items-center gap-2 text-sm">
                        <PlatformIcon platform={video.platform} className="size-4" />
                        <span className="font-medium">{video.authorHandle}</span>
                        <span className="text-muted-foreground">· {video.publishedAt}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <Snapshot icon={Eye} label="Views" value={formatNumber(video.views)} />
                        <Snapshot icon={Heart} label="Likes" value={formatNumber(video.likes)} />
                        <Snapshot icon={MessageCircle} label="Comments" value={formatNumber(video.comments)} />
                        <Snapshot icon={Clock} label="Duration" value={`${video.duration}s`} tone={durationOk ? "default" : "danger"} />
                      </div>
                    </div>
                  </div>

                  {!durationOk && (
                    <Alert variant="destructive">
                      <AlertTriangle />
                      <AlertTitle>Duration out of range</AlertTitle>
                      <AlertDescription>
                        This campaign requires {campaign.minDuration}&ndash;{campaign.maxDuration}s videos. Your video is{" "}
                        {video.duration}s and will be rejected on review. Post a compliant version before submitting.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>5. Confirm requirements</CardTitle>
                  <CardDescription>Submissions that miss any requirement are rejected during review.</CardDescription>
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
                      I confirm this video meets every requirement above, uses the required CTA
                      {campaign.requiredCta ? ` "${campaign.requiredCta}"` : ""}, and was posted from{" "}
                      <span className="font-medium text-foreground">{account?.handle}</span>.
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
              <CardTitle>Payout estimate</CardTitle>
              <CardDescription>
                {video ? "Based on your locked view count" : "Based on this campaign's rate"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Row label="Rate">{formatMoney(campaign.ratePerMillion)} / 1M</Row>
              <Row label="Min. views to earn">{formatNumber(campaign.minViews)}</Row>
              <Row label="Max per video">{formatMoney(campaign.maxPayoutPerVideo)}</Row>
              <Row label="Budget remaining">{formatMoney(remaining, { compact: true })}</Row>

              {payout && video ? (
                <>
                  <Separator />
                  <Row label={`Raw (${formatNumber(video.views)} views)`}>{formatMoney(payout.rawReward)}</Row>
                  {payout.limitReason === "per_video" && (
                    <Row label="Per-video cap applied" tone="warning">
                      &minus;{formatMoney(payout.rawReward - payout.finalReward)}
                    </Row>
                  )}
                  {payout.limitReason === "budget" && (
                    <Row label="Limited by remaining budget" tone="warning">
                      &minus;{formatMoney(payout.rawReward - payout.finalReward)}
                    </Row>
                  )}
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">You&apos;ll earn</span>
                    <span className="text-2xl font-bold text-primary tabular-nums">{formatMoney(payout.finalReward)}</span>
                  </div>
                  {payout.limitReason && (
                    <p className="text-xs text-muted-foreground">
                      {payout.limitReason === "per_video"
                        ? `Capped at ${formatMoney(campaign.maxPayoutPerVideo)} per video.`
                        : `Only ${formatMoney(remaining)} left in this campaign's budget.`}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Example at 500K views</span>
                    <span className="text-lg font-semibold text-primary tabular-nums">
                      {formatMoney((500000 / 1_000_000) * campaign.ratePerMillion)}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {stage === "review" && video && (
            <Button size="lg" disabled={!confirmed || !durationOk || submitting} onClick={finalize}>
              {submitting ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Upload data-icon="inline-start" />}
              {submitting ? "Submitting…" : "Submit for review"}
            </Button>
          )}

          <Alert>
            <ShieldCheck />
            <AlertTitle>Views are locked at submission</AlertTitle>
            <AlertDescription>
              We snapshot and verify view counts at submit time. Fake or purchased views are flagged and rejected.
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
      <span className={`text-base font-semibold tabular-nums ${tone === "danger" ? "text-destructive" : ""}`}>{value}</span>
    </div>
  )
}

function Row({ label, children, tone = "default" }: { label: string; children: React.ReactNode; tone?: "default" | "warning" }) {
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
  const copy: Record<VideoCheckOutcome, { title: string; body: React.ReactNode }> = {
    valid: { title: "", body: null },
    not_found: {
      title: "Video not found",
      body: "We couldn't find a video at that link. Check the URL is correct and the post is public.",
    },
    private: {
      title: "Video is private",
      body: "This post isn't public. Make the video public so we can verify its view count, then try again.",
    },
    wrong_account: {
      title: "Posted by a different account",
      body: "This video wasn't posted by the account you selected. You can only submit videos from an account you've verified.",
    },
    duplicate: {
      title: "Video already submitted",
      body: failure.duplicate ? (
        <span className="flex flex-col gap-2">
          <span>
            This video was already submitted to <span className="font-medium">{failure.duplicate.campaignTitle}</span> on{" "}
            {failure.duplicate.submittedAt}. Each video can only be submitted once.
          </span>
          <span className="flex items-center gap-2">
            <span className="text-xs">Existing status:</span>
            <SubmissionStatusBadge status={failure.duplicate.status} />
          </span>
        </span>
      ) : (
        "This video has already been submitted. Each video can only be submitted once."
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
            Try another link
          </Button>
          {failure.outcome === "duplicate" && (
            <Button size="sm" variant="ghost" onClick={onOpenSubmissions}>
              View my submissions
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  )
}
