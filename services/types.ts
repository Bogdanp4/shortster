import type { AppError } from "@/lib/errors"

// Every service method returns a Result instead of throwing, so call sites
// (mostly AppProvider) can branch on `ok` without wrapping every call in
// try/catch. `AppErrorException` remains available for the few places that
// prefer to throw (e.g. when a provider callback's return type must stay a
// bare value and errors are handled via a caller-side try/catch).
export type Result<T> = { ok: true; data: T } | { ok: false; error: AppError }

export interface CreateWithdrawalInput {
  amountMinor: number
  payoutMethodId: string
}

export interface CreateDepositInput {
  amountMinor: number
  paymentMethodId: string
}

export interface ReserveForCampaignInput {
  campaignTitle: string
  creatorBudgetMinor: number
  platformFeePercent: number
}

export interface ModerationDecisionInput {
  submissionId: string
  moderatorNote?: string
  // Manual submissions: the moderator-confirmed view count and the resulting
  // payable reward (already capped at MIN(claimed, verified) and the per-video
  // cap by the review UI). Omitted for automatic submissions, which fall back
  // to the locked reward captured at submission time.
  verifiedViews?: number
  finalRewardMinor?: number
}

export interface RejectSubmissionInput extends ModerationDecisionInput {
  rejectionReason: string
}

export interface FlagForAdminInput {
  submissionId: string
  reason: string
}

export type FraudCaseAction =
  | "clear"
  | "reject_submission"
  | "suspend_creator"
  | "freeze_withdrawals"
  | "ban_social_account"

export interface ResolveFraudCaseInput {
  caseId: string
  action: FraudCaseAction
  note?: string
}
