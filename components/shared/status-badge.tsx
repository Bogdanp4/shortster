import { cn } from "@/lib/utils"
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

const submissionMap: Record<SubmissionStatus, { tone: Tone; label: string }> = {
  pending: { tone: "warning", label: "Pending Review" },
  approved: { tone: "info", label: "Approved" },
  credited: { tone: "success", label: "Credited" },
  rejected: { tone: "danger", label: "Rejected" },
  fraud: { tone: "danger", label: "Fraud Review" },
}

export function SubmissionStatusBadge({ status }: { status: SubmissionStatus }) {
  const { tone, label } = submissionMap[status]
  return <StatusPill tone={tone}>{label}</StatusPill>
}

const campaignMap: Record<CampaignStatus, { tone: Tone; label: string }> = {
  active: { tone: "success", label: "Active" },
  draft: { tone: "neutral", label: "Draft" },
  paused: { tone: "warning", label: "Paused" },
  completed: { tone: "info", label: "Completed" },
}

export function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  const { tone, label } = campaignMap[status]
  return <StatusPill tone={tone}>{label}</StatusPill>
}

const verificationMap: Record<VerificationStatus, { tone: Tone; label: string }> = {
  unverified: { tone: "neutral", label: "Unverified" },
  challenge_created: { tone: "info", label: "Challenge Created" },
  pending: { tone: "warning", label: "Pending Verification" },
  verified: { tone: "success", label: "Verified" },
  failed: { tone: "danger", label: "Failed" },
  expired: { tone: "neutral", label: "Expired" },
  revoked: { tone: "danger", label: "Revoked" },
}

export function VerificationStatusBadge({ status }: { status: VerificationStatus }) {
  const { tone, label } = verificationMap[status]
  return <StatusPill tone={tone}>{label}</StatusPill>
}

type TransactionStatus = "completed" | "pending" | "failed"

const transactionMap: Record<TransactionStatus, { tone: Tone; label: string }> = {
  completed: { tone: "success", label: "Completed" },
  pending: { tone: "warning", label: "Pending" },
  failed: { tone: "danger", label: "Failed" },
}

export function TransactionStatusBadge({ status }: { status: TransactionStatus }) {
  const { tone, label } = transactionMap[status]
  return <StatusPill tone={tone}>{label}</StatusPill>
}

export function RiskBadge({ score }: { score: number }) {
  const tone: Tone = score >= 60 ? "danger" : score >= 30 ? "warning" : "success"
  const label = score >= 60 ? "High Risk" : score >= 30 ? "Medium Risk" : "Low Risk"
  return (
    <StatusPill tone={tone}>
      {score}/100 · {label}
    </StatusPill>
  )
}
