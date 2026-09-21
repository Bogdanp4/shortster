import { toAppError } from "@/lib/errors"
import type { CreatorWallet, FraudCase, Submission, WalletTransaction } from "@/lib/types"
import { generateReference, mockDelay, store, todayLabel } from "./store"
import type { FlagForAdminInput, ModerationDecisionInput, RejectSubmissionInput, Result } from "./types"

/**
 * A moderator decision can ripple across roles: the queue shrinks, the
 * creator's copy of the submission updates, and (on approval) the creator
 * wallet is credited. Services return every touched slice so the provider can
 * patch each cached view without a full refetch.
 */
export interface ModerationResult {
  submission: Submission
  creatorWallet?: CreatorWallet
  creatorTransaction?: WalletTransaction
}

function findQueued(submissionId: string): Submission | undefined {
  return store.moderationQueue.find((s) => s.id === submissionId)
}

/**
 * Mirrors a moderated submission back into the creator's own submission list
 * so "My Submissions" reflects the decision. Seed queue items authored by
 * other demo creators simply won't have a match here, which is fine.
 */
function syncCreatorSubmission(updated: Submission): void {
  store.submissions = store.submissions.map((s) => (s.id === updated.id ? updated : s))
}

export async function getQueue(): Promise<Result<Submission[]>> {
  await mockDelay()
  return { ok: true, data: store.moderationQueue }
}

export async function approve(input: ModerationDecisionInput): Promise<Result<ModerationResult>> {
  await mockDelay()
  const submission = findQueued(input.submissionId)
  if (!submission) return { ok: false, error: toAppError("not_found", "Submission not found.") }

  const manual = submission.metricsMode === "manual"
  const rewardMinor =
    input.finalRewardMinor ?? submission.finalRewardMinor ?? submission.calculatedRewardMinor
  const payableViews = input.verifiedViews ?? submission.viewsAtSubmission

  const updated: Submission = {
    ...submission,
    status: "credited",
    moderatorNote: input.moderatorNote,
    finalRewardMinor: rewardMinor,
    moderatorVerifiedViews: manual ? input.verifiedViews : undefined,
    approvedPayableViews: payableViews,
  }
  store.moderationQueue = store.moderationQueue.filter((s) => s.id !== input.submissionId)
  syncCreatorSubmission(updated)

  // Credit the approved reward to the creator wallet and record the earning so
  // it surfaces in Earnings history. Creator fee is 0% — they keep 100%.
  const wallet: CreatorWallet = {
    ...store.creatorWallet,
    availableMinor: store.creatorWallet.availableMinor + rewardMinor,
    lifetimeMinor: store.creatorWallet.lifetimeMinor + rewardMinor,
  }
  store.creatorWallet = wallet

  const transaction: WalletTransaction = {
    id: `ctx-${Date.now()}`,
    date: todayLabel(),
    type: "Earning",
    description: submission.campaignTitle,
    amountMinor: rewardMinor,
    status: "completed",
    reference: generateReference("REW"),
    campaign: submission.campaignTitle,
  }
  store.creatorTransactions = [transaction, ...store.creatorTransactions]

  return { ok: true, data: { submission: updated, creatorWallet: wallet, creatorTransaction: transaction } }
}

export async function reject(input: RejectSubmissionInput): Promise<Result<ModerationResult>> {
  await mockDelay()
  const submission = findQueued(input.submissionId)
  if (!submission) return { ok: false, error: toAppError("not_found", "Submission not found.") }

  const updated: Submission = {
    ...submission,
    status: "rejected",
    rejectionReason: input.rejectionReason,
    moderatorNote: input.moderatorNote,
    // Rejected work pays nothing.
    finalRewardMinor: 0,
  }
  store.moderationQueue = store.moderationQueue.filter((s) => s.id !== input.submissionId)
  syncCreatorSubmission(updated)

  return { ok: true, data: { submission: updated } }
}

/**
 * Escalates a submission to admin review and opens a fraud case for
 * investigation — the replacement for the old moderator-only "fraud" status
 * and standalone fraud queue.
 */
export async function flagForAdmin(input: FlagForAdminInput): Promise<Result<ModerationResult>> {
  await mockDelay()
  const submission = findQueued(input.submissionId)
  if (!submission) return { ok: false, error: toAppError("not_found", "Submission not found.") }

  const updated: Submission = { ...submission, status: "admin_review", moderatorNote: input.reason }
  store.moderationQueue = store.moderationQueue.filter((s) => s.id !== input.submissionId)
  syncCreatorSubmission(updated)

  const fraudCase: FraudCase = {
    id: `fr-${Date.now()}`,
    creatorName: submission.creatorName,
    creatorHandle: submission.creatorHandle,
    campaign: submission.campaignTitle,
    riskScore: submission.riskScore,
    flags: [{ points: submission.riskScore, reason: input.reason }],
    previousSubmissions: 0,
    rejectedSubmissions: 0,
    linkedAccounts: 0,
  }
  store.fraudCases = [fraudCase, ...store.fraudCases]

  return { ok: true, data: { submission: updated } }
}
