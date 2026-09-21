"use client"

import { useMemo, useState } from "react"
import { Check, X, Flag, Eye, Heart, MessageCircle, Clock, PencilLine, Zap, ImageIcon, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

import { useApp } from "@/components/app/app-provider"
import { getCampaign } from "@/lib/mock-data"
import { formatCurrency, formatNumber } from "@/lib/format"
import { buildRequirementsChecklist } from "@/lib/domain/requirements"
import { PageHeader } from "@/components/shared/page-header"
import { PlatformIcon } from "@/components/shared/platform-icon"
import { RiskBadge } from "@/components/shared/status-badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field"
import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/ui/input-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useT } from "@/components/i18n/locale-provider"

type CheckStatus = "passed" | "failed" | "needs_review"

function CheckStatusBadge({ status, t }: { status: CheckStatus; t: (key: string) => string }) {
  if (status === "passed") {
    return (
      <Badge variant="secondary" className="gap-1 text-success">
        <Check className="size-3" />
        {t("reviewDetail.statusPassed")}
      </Badge>
    )
  }
  if (status === "failed") {
    return (
      <Badge variant="secondary" className="gap-1 text-destructive">
        <X className="size-3" />
        {t("reviewDetail.statusFailed")}
      </Badge>
    )
  }
  return (
    <Badge variant="secondary" className="gap-1 text-warning">
      <Clock className="size-3" />
      {t("reviewDetail.statusNeedsReview")}
    </Badge>
  )
}

export function ReviewDetailView() {
  const t = useT()
  const { params, navigate, moderationQueue, approveSubmission, rejectSubmission, flagSubmissionForAdmin } = useApp()
  const submission = moderationQueue.find((s) => s.id === params.submissionId) ?? moderationQueue[0]
  const campaign = getCampaign(submission.campaignId)

  const manual = submission.metricsMode === "manual"
  const requirements = useMemo(
    () => (campaign ? buildRequirementsChecklist(campaign.requirements, t) : []),
    [campaign, t],
  )

  // Requirements split by how they're verified. Automatic checks are read from
  // the video/account snapshot and shown as read-only statuses; manual checks
  // are ticked by the moderator.
  const autoItems = useMemo(() => requirements.filter((r) => r.kind === "automatic"), [requirements])
  const manualItems = useMemo(() => requirements.filter((r) => r.kind === "manual"), [requirements])
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  // Manual submissions: moderator confirms the real view count. Payout is
  // capped at the lower of declared and verified, so overstating never pays.
  const claimed = submission.claimedViews ?? submission.viewsAtSubmission
  const [verifiedInput, setVerifiedInput] = useState(String(claimed))
  const verifiedViews = Number(verifiedInput) || 0
  const payableViews = manual ? Math.min(claimed, verifiedViews) : submission.viewsAtSubmission
  const overstated = manual && verifiedViews < claimed
  const payableRewardMinor = useMemo(() => {
    if (!manual) return submission.finalRewardMinor ?? submission.calculatedRewardMinor
    const raw = Math.round((payableViews / 1_000_000) * submission.ratePerMillionMinor)
    const cap = campaign?.maxPayoutPerVideoMinor ?? Number.POSITIVE_INFINITY
    return Math.min(raw, cap)
  }, [manual, payableViews, submission, campaign])

  // Automatic checks are graded from the submission snapshot. Missing data
  // yields "needs_review" (not a hard fail) so seed items aren't blocked.
  const req = campaign?.requirements
  function autoStatus(key: string): CheckStatus {
    if (!req) return "needs_review"
    switch (key) {
      case "duration": {
        const okMin = req.minVideoDurationSeconds > 0 ? submission.duration >= req.minVideoDurationSeconds : true
        const okMax = req.maxVideoDurationSeconds > 0 ? submission.duration <= req.maxVideoDurationSeconds : true
        return okMin && okMax ? "passed" : "failed"
      }
      case "minViews":
        return payableViews >= req.minViews ? "passed" : "failed"
      case "minFollowers":
        if (submission.followersAtSubmission === undefined) return "needs_review"
        return submission.followersAtSubmission >= req.minFollowers ? "passed" : "failed"
      case "hashtag":
        if (submission.requiredHashtagPresent === undefined) return "needs_review"
        return submission.requiredHashtagPresent ? "passed" : "failed"
      default:
        return "needs_review"
    }
  }

  const autoFailed = autoItems.some((r) => autoStatus(r.key) === "failed")
  const allManualChecked = manualItems.every((r) => checked[r.key])
  // Approve is unlocked when the moderator has confirmed every manual check and
  // no automatic check hard-failed. "Mark All Manual Checks as Passed" ticks
  // manual items in one click but never overrides automatic failures.
  const canApprove = allManualChecked && !autoFailed
  function markAllManualPassed() {
    setChecked((prev) => {
      const next = { ...prev }
      for (const r of manualItems) next[r.key] = true
      return next
    })
  }

  const stats = manual
    ? [
        { icon: Eye, label: t("reviewDetail.declaredViews"), value: formatNumber(claimed) },
        { icon: Heart, label: t("reviewDetail.likes"), value: formatNumber(submission.likes) },
        { icon: MessageCircle, label: t("reviewDetail.comments"), value: formatNumber(submission.comments) },
        { icon: Clock, label: t("reviewDetail.duration"), value: `${submission.duration}s` },
      ]
    : [
        { icon: Eye, label: t("reviewDetail.verifiedViews"), value: formatNumber(submission.viewsAtSubmission) },
        { icon: Heart, label: t("reviewDetail.likes"), value: formatNumber(submission.likes) },
        { icon: MessageCircle, label: t("reviewDetail.comments"), value: formatNumber(submission.comments) },
        { icon: Clock, label: t("reviewDetail.duration"), value: `${submission.duration}s` },
      ]

  const [note, setNote] = useState("")
  const [pending, setPending] = useState(false)

  async function approve() {
    if (!canApprove) {
      toast.error(t("reviewDetail.completeChecklistError"), { description: t("reviewDetail.completeChecklistDesc") })
      return
    }
    setPending(true)
    try {
      await approveSubmission(submission.id, {
        moderatorNote: note.trim() || undefined,
        finalRewardMinor: payableRewardMinor,
        verifiedViews: manual ? payableViews : undefined,
      })
      toast.success(t("reviewDetail.approvedToast", { id: submission.id.toUpperCase() }), {
        description: manual
          ? t("reviewDetail.approvedManualDesc", {
              amount: formatCurrency(payableRewardMinor),
              views: formatNumber(payableViews),
            })
          : t("reviewDetail.approvedAutoDesc"),
      })
      navigate("queue")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("reviewDetail.completeChecklistError"))
    } finally {
      setPending(false)
    }
  }

  async function reject() {
    setPending(true)
    try {
      await rejectSubmission(submission.id, note.trim() || t("reviewDetail.rejectedDesc"), note.trim() || undefined)
      toast.error(t("reviewDetail.rejectedToast", { id: submission.id.toUpperCase() }), {
        description: t("reviewDetail.rejectedDesc"),
      })
      navigate("queue")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("reviewDetail.rejectedDesc"))
    } finally {
      setPending(false)
    }
  }

  async function flagForAdmin() {
    setPending(true)
    try {
      await flagSubmissionForAdmin(submission.id, note.trim() || t("reviewDetail.flaggedToast"))
      toast.warning(t("reviewDetail.flaggedToast"))
      navigate("queue")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("reviewDetail.flaggedToast"))
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("reviewDetail.title")}
        description={`${submission.id.toUpperCase()} · ${submission.campaignTitle}`}
        backLabel={t("reviewDetail.backLabel")}
        onBack={() => navigate("queue")}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="relative aspect-video w-full">
              <Image
                src={submission.thumb || "/placeholder.svg"}
                alt={submission.campaignTitle}
                fill
                className="object-cover"
              />
              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-background/80 px-3 py-1.5 backdrop-blur">
                <PlatformIcon platform={submission.platform} className="size-4" />
                <span className="text-xs font-medium">{submission.accountHandle}</span>
              </div>
              <Badge
                variant="secondary"
                className={`absolute right-4 top-4 gap-1 ${manual ? "text-warning" : "text-success"}`}
              >
                {manual ? <PencilLine className="size-3" /> : <Zap className="size-3" />}
                {manual ? t("reviewDetail.manualVerification") : t("reviewDetail.autoVerification")}
              </Badge>
            </div>
            <CardContent className="grid grid-cols-2 gap-4 pt-6 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <s.icon className="size-4" />
                    <span className="text-xs">{s.label}</span>
                  </div>
                  <span className="text-lg font-semibold tabular-nums">{s.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Manual: verify declared views against uploaded proof */}
          {manual && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PencilLine className="size-4 text-warning" />
                  {t("reviewDetail.verifyDeclaredViews")}
                </CardTitle>
                <CardDescription>{t("reviewDetail.verifyDeclaredViewsDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium">{t("reviewDetail.proofScreenshots")}</span>
                  <div className="flex flex-wrap gap-3">
                    {(submission.proofAssets ?? []).map((src, i) => (
                      <a
                        key={`${src}-${i}`}
                        href={src}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative size-28 overflow-hidden rounded-lg border"
                      >
                        <Image
                          src={src || "/placeholder.svg"}
                          alt={t("reviewDetail.proofAlt", { n: i + 1 })}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                          sizes="112px"
                        />
                        <span className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 transition-opacity group-hover:opacity-100">
                          <ExternalLink className="size-4" />
                        </span>
                      </a>
                    ))}
                    {(submission.proofAssets ?? []).length === 0 && (
                      <div className="flex size-28 flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-muted-foreground">
                        <ImageIcon className="size-5" />
                        <span className="text-xs">{t("reviewDetail.noProof")}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel>{t("reviewDetail.creatorDeclared")}</FieldLabel>
                    <div className="flex h-9 items-center rounded-md border bg-muted/40 px-3 text-sm font-medium tabular-nums">
                      {formatNumber(claimed)} {t("reviewDetail.viewsUnit")}
                    </div>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="verified">{t("reviewDetail.moderatorVerified")}</FieldLabel>
                    <InputGroup>
                      <InputGroupAddon>
                        <Eye className="size-4" />
                      </InputGroupAddon>
                      <InputGroupInput
                        id="verified"
                        inputMode="numeric"
                        value={verifiedInput}
                        onChange={(e) => setVerifiedInput(e.target.value.replace(/[^0-9]/g, ""))}
                      />
                    </InputGroup>
                    <FieldDescription>{t("reviewDetail.setToRealCount")}</FieldDescription>
                  </Field>
                </div>

                {overstated && (
                  <Alert variant="destructive">
                    <Flag />
                    <AlertTitle>{t("reviewDetail.overstatedTitle")}</AlertTitle>
                    <AlertDescription>
                      {t("reviewDetail.overstatedDesc", {
                        claimed: formatNumber(claimed),
                        verified: formatNumber(verifiedViews),
                      })}
                    </AlertDescription>
                  </Alert>
                )}

                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">{t("reviewDetail.payableViews")}</span>
                    <span className="text-xs text-muted-foreground">
                      {t("reviewDetail.payableViewsFormula", {
                        claimed: formatNumber(claimed),
                        verified: formatNumber(verifiedViews),
                      })}
                    </span>
                  </div>
                  <span className="text-lg font-semibold tabular-nums">{formatNumber(payableViews)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>{t("reviewDetail.checklistTitle")}</CardTitle>
              <CardDescription>{t("reviewDetail.checklistDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {requirements.length === 0 && (
                <p className="text-sm text-muted-foreground">{t("reviewDetail.noRequirements")}</p>
              )}

              {autoItems.length > 0 && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Zap className="size-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {t("reviewDetail.automaticChecks")}
                    </span>
                  </div>
                  {autoItems.map((r) => (
                    <div key={r.key} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-muted-foreground">{r.label}</span>
                      <CheckStatusBadge status={autoStatus(r.key)} t={t} />
                    </div>
                  ))}
                </div>
              )}

              {manualItems.length > 0 && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <PencilLine className="size-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {t("reviewDetail.manualChecks")}
                      </span>
                    </div>
                    <Button variant="outline" size="sm" onClick={markAllManualPassed} disabled={allManualChecked}>
                      <Check data-icon="inline-start" />
                      {t("reviewDetail.markAllManualPassed")}
                    </Button>
                  </div>
                  {manualItems.map((r) => (
                    <label key={r.key} className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex items-center gap-3">
                        <Checkbox
                          checked={!!checked[r.key]}
                          onCheckedChange={(v) => setChecked((prev) => ({ ...prev, [r.key]: v === true }))}
                        />
                        <span className={checked[r.key] ? "text-foreground" : "text-muted-foreground"}>{r.label}</span>
                      </span>
                      <CheckStatusBadge status={checked[r.key] ? "passed" : "needs_review"} t={t} />
                    </label>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("reviewDetail.noteTitle")}</CardTitle>
              <CardDescription>{t("reviewDetail.noteDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="note" className="sr-only">
                    {t("reviewDetail.noteTitle")}
                  </FieldLabel>
                  <Textarea
                    id="note"
                    rows={3}
                    placeholder={t("reviewDetail.notePlaceholder")}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("reviewDetail.riskAssessment")}</CardTitle>
              <CardDescription>{t("reviewDetail.riskAssessmentDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t("reviewDetail.riskScore")}</span>
                <RiskBadge score={submission.riskScore} />
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t("reviewDetail.creator")}</span>
                <span className="font-medium">{submission.creatorName}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t("reviewDetail.account")}</span>
                <span className="font-medium">{submission.accountHandle}</span>
              </div>
              {submission.followersAtSubmission !== undefined && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("reviewDetail.followers")}</span>
                  <span className="font-medium">{formatNumber(submission.followersAtSubmission)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t("reviewDetail.verification")}</span>
                <span className="font-medium">
                  {manual ? t("reviewDetail.manualProof") : t("reviewDetail.automaticApi")}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t("reviewDetail.reward")}</span>
                <span className="font-medium">{formatCurrency(payableRewardMinor)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col gap-3 pt-6">
              <Button size="lg" onClick={approve} disabled={!canApprove || pending}>
                <Check data-icon="inline-start" />
                {t("reviewDetail.approveSubmission")}
              </Button>
              {!canApprove && (
                <p className="text-center text-xs text-muted-foreground">
                  {autoFailed
                    ? t("reviewDetail.autoCheckFailedHint")
                    : t("reviewDetail.completeManualChecksHint", { count: manualItems.length })}
                </p>
              )}
              <Button size="lg" variant="outline" onClick={reject} disabled={pending}>
                <X data-icon="inline-start" />
                {t("reviewDetail.rejectSubmission")}
              </Button>
              <Button size="lg" variant="ghost" onClick={flagForAdmin} disabled={pending}>
                <Flag data-icon="inline-start" />
                {t("reviewDetail.flagForAdminReview")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
