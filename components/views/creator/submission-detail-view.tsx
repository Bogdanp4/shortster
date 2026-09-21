"use client"

import { ExternalLink, Heart, MessageCircle, Clock, Eye, Lock } from "lucide-react"

import { useApp } from "@/components/app/app-provider"
import { useT } from "@/components/i18n/locale-provider"
import { formatCurrency, formatNumber } from "@/lib/format"
import { PageHeader } from "@/components/shared/page-header"
import { PlatformIcon } from "@/components/shared/platform-icon"
import { SubmissionStatusBadge } from "@/components/shared/status-badge"
import { BrandAvatar } from "@/components/shared/brand-avatar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Image from "next/image"

export function SubmissionDetailView() {
  const { params, navigate, submissions } = useApp()
  const t = useT()
  const submission = submissions.find((s) => s.id === params.id) ?? submissions[0]

  const reward = submission.cappedReward ?? submission.reward
  const capped = submission.cappedReward != null && submission.cappedReward < submission.reward

  const stats = [
    { icon: Eye, label: t("submissionDetail.views"), value: formatNumber(submission.viewsAtSubmission) },
    { icon: Heart, label: t("submissionDetail.likes"), value: formatNumber(submission.likes) },
    { icon: MessageCircle, label: t("submissionDetail.comments"), value: formatNumber(submission.comments) },
    { icon: Clock, label: t("submissionDetail.duration"), value: `${submission.duration}s` },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={submission.campaignTitle}
        description={t("submissionDetail.submissionId", { id: submission.id.toUpperCase() })}
        backLabel={t("submissionDetail.backToSubmissions")}
        onBack={() => navigate("submissions")}
      >
        <Button variant="outline" onClick={() => window.open(submission.videoUrl, "_blank")}>
          <ExternalLink data-icon="inline-start" />
          {t("submissionDetail.viewVideo")}
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="relative aspect-video w-full">
              <Image src={submission.thumb || "/placeholder.svg"} alt={submission.campaignTitle} fill className="object-cover" />
              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-background/80 px-3 py-1.5 backdrop-blur">
                <PlatformIcon platform={submission.platform} className="size-4" />
                <span className="text-xs font-medium">{submission.accountHandle}</span>
              </div>
            </div>
            <CardContent className="flex flex-col gap-4 pt-6">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Lock className="size-3.5 text-primary" />
                <span>
                  {t("submissionDetail.viewsLocked", { when: submission.lockedAt ? ` · ${submission.lockedAt}` : "" })}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {stats.map((s) => (
                  <div key={s.label} className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <s.icon className="size-4" />
                      <span className="text-xs">{s.label}</span>
                    </div>
                    <span className="text-lg font-semibold tabular-nums">{s.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {(submission.status === "rejected" || submission.status === "fraud") &&
            (submission.rejectionReason || submission.moderatorNote) && (
              <Alert variant="destructive">
                <AlertTitle>
                  {submission.status === "fraud" ? t("submissionDetail.flaggedFraud") : t("submissionDetail.submissionRejected")}
                </AlertTitle>
                <AlertDescription>
                  {submission.rejectionReason ?? submission.moderatorNote}
                </AlertDescription>
              </Alert>
            )}

          <Card>
            <CardHeader>
              <CardTitle>{t("submissionDetail.timeline")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {[
                { label: t("submissionDetail.submitted"), detail: submission.submittedAt, done: true },
                { label: t("submissionDetail.viewsVerified"), detail: t("submissionDetail.automatedCheckPassed"), done: submission.status !== "pending" },
                {
                  label: t("submissionDetail.moderationReview"),
                  detail: submission.status === "pending" ? t("submissionDetail.inProgress") : t("submissionDetail.complete"),
                  done: submission.status !== "pending",
                },
                {
                  label: t("submissionDetail.rewardCredited"),
                  detail: submission.status === "credited" ? formatCurrency(reward) : t("submissionDetail.awaitingApproval"),
                  done: submission.status === "credited",
                },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className={`size-2.5 rounded-full ${step.done ? "bg-primary" : "bg-muted-foreground/30"}`}
                  />
                  <div className="flex flex-1 items-center justify-between">
                    <span className="text-sm font-medium">{step.label}</span>
                    <span className="text-xs text-muted-foreground">{step.detail}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("submissionDetail.status")}</CardTitle>
              <CardDescription>{t("submissionDetail.currentReviewState")}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <SubmissionStatusBadge status={submission.status} />
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t("submissionDetail.rate")}</span>
                <span className="font-medium">{formatCurrency(submission.ratePerMillion)} / 1M</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t("submissionDetail.rawReward")}</span>
                <span className="font-medium tabular-nums">{formatCurrency(submission.reward)}</span>
              </div>
              {capped && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("submissionDetail.perVideoCap")}</span>
                  <span className="font-medium tabular-nums">{formatCurrency(submission.cappedReward!)}</span>
                </div>
              )}
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t("submissionDetail.payout")}</span>
                <span className="text-xl font-semibold text-primary tabular-nums">{formatCurrency(reward)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("submissionDetail.campaign")}</CardTitle>
            </CardHeader>
            <CardContent>
              <button
                className="flex w-full items-center gap-3 text-left"
                onClick={() => navigate("campaign", { id: submission.campaignId })}
              >
                <BrandAvatar name={submission.brand} src={submission.cover} className="size-10" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{submission.campaignTitle}</span>
                  <span className="text-xs text-muted-foreground">{submission.brand}</span>
                </div>
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
