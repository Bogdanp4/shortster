import { cn } from "@/lib/utils"
import { useT } from "@/components/i18n/locale-provider"
import type { SubmissionStatus, CampaignStatus, VerificationStatus } from "@/lib/types"

type Tone = "success" | "warning" | "danger" | "info" | "neutral" | "brand"

const toneClasses: Record<Tone, string> = {
  success: "bg-success/12 text-success border-success/20",
  warning: "bg-warning/12 text-warning border-warning/20",
  danger: "bg-destructive/12 text-destructive border-destructive/25",
  info: "bg-info/12 text-info border-info/25",
  neutral: "bg-muted text-muted-foreground border-border",
  brand: "bg-primary/12 text-primary border-primary/25",
}

export function StatusPill({
  tone,
  children,
  className,
  dot = true,
}: {
  tone: Tone
  children: React.ReactNode
  className?: string
  dot?: boolean
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className,
      )}
    >
      {dot && <span className={cn("size-1.5 rounded-full", `bg-current`)} />}
      {children}
    </span>
  )
}

const submissionTone: Record<SubmissionStatus, Tone> = {
  pending: "warning",
  approved: "info",
  credited: "success",
  rejected: "danger",
  admin_review: "danger",
}

export function SubmissionStatusBadge({ status }: { status: SubmissionStatus }) {
  const t = useT()
  return <StatusPill tone={submissionTone[status]}>{t(`status.submission.${status}`)}</StatusPill>
}

const campaignTone: Record<CampaignStatus, Tone> = {
  active: "success",
  draft: "neutral",
  paused: "warning",
  completed: "info",
}

export function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  const t = useT()
  return <StatusPill tone={campaignTone[status]}>{t(`status.campaign.${status}`)}</StatusPill>
}

const verificationTone: Record<VerificationStatus, Tone> = {
  unverified: "neutral",
  challenge_created: "info",
  pending: "warning",
  verified: "success",
  failed: "danger",
  expired: "neutral",
  revoked: "danger",
}

export function VerificationStatusBadge({ status }: { status: VerificationStatus }) {
  const t = useT()
  return <StatusPill tone={verificationTone[status]}>{t(`status.verification.${status}`)}</StatusPill>
}

type TransactionStatus = "completed" | "pending" | "failed"

const transactionTone: Record<TransactionStatus, Tone> = {
  completed: "success",
  pending: "warning",
  failed: "danger",
}

export function TransactionStatusBadge({ status }: { status: TransactionStatus }) {
  const t = useT()
  return <StatusPill tone={transactionTone[status]}>{t(`status.transaction.${status}`)}</StatusPill>
}

export function RiskBadge({ score }: { score: number }) {
  const t = useT()
  const tone: Tone = score >= 60 ? "danger" : score >= 30 ? "warning" : "success"
  const label = score >= 60 ? t("status.risk.high") : score >= 30 ? t("status.risk.medium") : t("status.risk.low")
  return (
    <StatusPill tone={tone}>
      {score}/100 · {label}
    </StatusPill>
  )
}
