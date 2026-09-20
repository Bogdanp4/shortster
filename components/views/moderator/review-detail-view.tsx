"use client"

import { useMemo, useState } from "react"
import { Check, X, Flag, Eye, Heart, MessageCircle, Clock, PencilLine, Zap, ImageIcon, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

import { useApp } from "@/components/app/app-provider"
import { moderationQueue, getCampaign } from "@/lib/mock-data"
import { formatCurrency, formatNumber } from "@/lib/format"
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

export function ReviewDetailView() {
  const { params, navigate } = useApp()
  const submission = moderationQueue.find((s) => s.id === params.submissionId) ?? moderationQueue[0]
  const campaign = getCampaign(submission.campaignId)

  const manual = submission.metricsMode === "manual"
  const requirements = campaign?.requirements ?? []

  // Controlled requirement checklist — every item must be ticked to approve.
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const allChecked = requirements.length > 0 && requirements.every((r) => checked[r])

  // Manual submissions: moderator confirms the real view count. Payout is
  // capped at the lower of declared and verified, so overstating never pays.
  const claimed = submission.claimedViews ?? submission.viewsAtSubmission
  const [verifiedInput, setVerifiedInput] = useState(String(claimed))
  const verifiedViews = Number(verifiedInput) || 0
  const payableViews = manual ? Math.min(claimed, verifiedViews) : submission.viewsAtSubmission
  const overstated = manual && verifiedViews < claimed
  const payableReward = useMemo(() => {
    if (!manual) return submission.cappedReward ?? submission.reward
    const raw = (payableViews / 1_000_000) * submission.ratePerMillion
    const cap = campaign?.maxPayoutPerVideo ?? Number.POSITIVE_INFINITY
    return Math.min(raw, cap)
  }, [manual, payableViews, submission, campaign])

  const stats = manual
    ? [
        { icon: Eye, label: "Declared views", value: formatNumber(claimed) },
        { icon: Heart, label: "Likes", value: formatNumber(submission.likes) },
        { icon: MessageCircle, label: "Comments", value: formatNumber(submission.comments) },
        { icon: Clock, label: "Duration", value: `${submission.duration}s` },
      ]
    : [
        { icon: Eye, label: "Verified views", value: formatNumber(submission.viewsAtSubmission) },
        { icon: Heart, label: "Likes", value: formatNumber(submission.likes) },
        { icon: MessageCircle, label: "Comments", value: formatNumber(submission.comments) },
        { icon: Clock, label: "Duration", value: `${submission.duration}s` },
      ]

  function approve() {
    if (!allChecked) {
      toast.error("Complete the checklist", { description: "Tick every requirement before approving." })
      return
    }
    toast.success(`Approved ${submission.id.toUpperCase()}`, {
      description: manual
        ? `Creator credited ${formatCurrency(payableReward)} on ${formatNumber(payableViews)} verified views.`
        : "Creator will be credited.",
    })
    navigate("queue")
  }
  function reject() {
    toast.error(`Rejected ${submission.id.toUpperCase()}`, { description: "Creator has been notified." })
    navigate("queue")
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Review submission"
        description={`${submission.id.toUpperCase()} · ${submission.campaignTitle}`}
        backLabel="Back to queue"
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
                {manual ? "Manual verification" : "Automatic verification"}
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
                  Verify declared views
                </CardTitle>
                <CardDescription>
                  This account can&apos;t be read via API. Confirm the view count against the creator&apos;s proof —
                  payout is capped at the lower of declared and verified.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium">Proof screenshots</span>
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
                          alt={`Proof ${i + 1}`}
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
                        <span className="text-xs">No proof</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel>Creator declared</FieldLabel>
                    <div className="flex h-9 items-center rounded-md border bg-muted/40 px-3 text-sm font-medium tabular-nums">
                      {formatNumber(claimed)} views
                    </div>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="verified">Moderator verified</FieldLabel>
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
                    <FieldDescription>Set to the real count shown in the proof.</FieldDescription>
                  </Field>
                </div>

                {overstated && (
                  <Alert variant="destructive">
                    <Flag />
                    <AlertTitle>Declared count higher than verified</AlertTitle>
                    <AlertDescription>
                      The creator declared {formatNumber(claimed)} but you verified {formatNumber(verifiedViews)}. Payout
                      will be based on the lower verified figure. Consider flagging if the gap looks intentional.
                    </AlertDescription>
                  </Alert>
                )}

                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Payable views</span>
                    <span className="text-xs text-muted-foreground">
                      min(declared {formatNumber(claimed)}, verified {formatNumber(verifiedViews)})
                    </span>
                  </div>
                  <span className="text-lg font-semibold tabular-nums">{formatNumber(payableViews)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Requirement checklist</CardTitle>
              <CardDescription>Confirm the video meets every item in the brief before approving</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {requirements.length === 0 && (
                <p className="text-sm text-muted-foreground">This campaign has no structured requirements.</p>
              )}
              {requirements.map((r) => (
                <label key={r} className="flex items-center gap-3 text-sm">
                  <Checkbox
                    checked={!!checked[r]}
                    onCheckedChange={(v) => setChecked((prev) => ({ ...prev, [r]: v === true }))}
                  />
                  <span className={checked[r] ? "text-foreground" : "text-muted-foreground"}>{r}</span>
                </label>
              ))}
              {submission.requiredHashtagPresent !== undefined && (
                <>
                  <Separator />
                  <div className="flex items-center gap-2 text-sm">
                    {submission.requiredHashtagPresent ? (
                      <Check className="size-4 text-success" />
                    ) : (
                      <X className="size-4 text-destructive" />
                    )}
                    <span className="text-muted-foreground">
                      Required hashtag {submission.requiredHashtagPresent ? "detected" : "missing"} (auto-scan)
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Moderator note</CardTitle>
              <CardDescription>Required when rejecting a submission</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="note" className="sr-only">
                    Note
                  </FieldLabel>
                  <Textarea id="note" rows={3} placeholder="Explain your decision…" />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Risk assessment</CardTitle>
              <CardDescription>Automated fraud signals</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Risk score</span>
                <RiskBadge score={submission.riskScore} />
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Creator</span>
                <span className="font-medium">{submission.creatorName}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Account</span>
                <span className="font-medium">{submission.accountHandle}</span>
              </div>
              {submission.followersAtSubmission !== undefined && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Followers</span>
                  <span className="font-medium">{formatNumber(submission.followersAtSubmission)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Verification</span>
                <span className="font-medium">{manual ? "Manual (proof)" : "Automatic (API)"}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Reward</span>
                <span className="font-medium">{formatCurrency(payableReward)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col gap-3 pt-6">
              <Button size="lg" onClick={approve} disabled={!allChecked}>
                <Check data-icon="inline-start" />
                Approve submission
              </Button>
              {!allChecked && requirements.length > 0 && (
                <p className="text-center text-xs text-muted-foreground">
                  Tick all {requirements.length} requirements to enable approval
                </p>
              )}
              <Button size="lg" variant="outline" onClick={reject}>
                <X data-icon="inline-start" />
                Reject submission
              </Button>
              <Button
                size="lg"
                variant="ghost"
                onClick={() => {
                  toast.warning("Flagged for fraud review")
                  navigate("fraud")
                }}
              >
                <Flag data-icon="inline-start" />
                Flag for fraud
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
