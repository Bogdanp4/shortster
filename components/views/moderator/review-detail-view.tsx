"use client"

import { Check, X, Flag, Eye, Heart, MessageCircle, Clock } from "lucide-react"
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
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Checkbox } from "@/components/ui/checkbox"

export function ReviewDetailView() {
  const { selectedSubmissionId, navigate } = useApp()
  const submission = moderationQueue.find((s) => s.id === selectedSubmissionId) ?? moderationQueue[0]
  const campaign = getCampaign(submission.campaignId)

  const stats = [
    { icon: Eye, label: "Views", value: formatNumber(submission.viewsAtSubmission) },
    { icon: Heart, label: "Likes", value: formatNumber(submission.likes) },
    { icon: MessageCircle, label: "Comments", value: formatNumber(submission.comments) },
    { icon: Clock, label: "Duration", value: `${submission.duration}s` },
  ]

  function approve() {
    toast.success(`Approved ${submission.id.toUpperCase()}`, { description: "Creator will be credited." })
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
              <Image src={submission.thumb || "/placeholder.svg"} alt={submission.campaignTitle} fill className="object-cover" />
              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-background/80 px-3 py-1.5 backdrop-blur">
                <PlatformIcon platform={submission.platform} className="size-4" />
                <span className="text-xs font-medium">{submission.accountHandle}</span>
              </div>
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

          <Card>
            <CardHeader>
              <CardTitle>Requirement checklist</CardTitle>
              <CardDescription>Confirm the video meets the brief before approving</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {(campaign?.requirements ?? []).map((r, i) => (
                <label key={r} className="flex items-center gap-3 text-sm">
                  <Checkbox defaultChecked={i < 3} />
                  <span className="text-muted-foreground">{r}</span>
                </label>
              ))}
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
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Reward</span>
                <span className="font-medium">{formatCurrency(submission.cappedReward ?? submission.reward)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col gap-3 pt-6">
              <Button size="lg" onClick={approve}>
                <Check data-icon="inline-start" />
                Approve submission
              </Button>
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
