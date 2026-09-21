import { toAppError } from "@/lib/errors"
import type { FraudCase, Submission } from "@/lib/types"
import { mockDelay, store } from "./store"
import type { FlagForAdminInput, ModerationDecisionInput, RejectSubmissionInput, Result } from "./types"

function findQueued(submissionId: string): Submission | undefined {
  return store.moderationQueue.find((s) => s.id === submissionId)
}

export async function getQueue(): Promise<Result<Submission[]>> {
  await mockDelay()
  return { ok: true, data: store.moderationQueue }
}

export async function approve(input: ModerationDecisionInput): Promise<Result<Submission>> {
  await mockDelay()
  const submission = findQueued(input.submissionId)
  if (!submission) return { ok: false, error: toAppError("not_found", "Submission not found.") }

  const updated: Submission = { ...submission, status: "approved", moderatorNote: input.moderatorNote }
  store.moderationQueue = store.moderationQueue.filter((s) => s.id !== input.submissionId)
  return { ok: true, data: updated }
}

export async function reject(input: RejectSubmissionInput): Promise<Result<Submission>> {
  await mockDelay()
  const submission = findQueued(input.submissionId)
  if (!submission) return { ok: false, error: toAppError("not_found", "Submission not found.") }

  const updated: Submission = {
    ...submission,
    status: "rejected",
    rejectionReason: input.rejectionReason,
    moderatorNote: input.moderatorNote,
  }
  store.moderationQueue = store.moderationQueue.filter((s) => s.id !== input.submissionId)
  return { ok: true, data: updated }
}

/**
 * Escalates a submission to admin review and opens a fraud case for
 * investigation — the replacement for the old moderator-only "fraud" status
 * and standalone fraud queue.
 */
export async function flagForAdmin(input: FlagForAdminInput): Promise<Result<Submission>> {
  await mockDelay()
  const submission = findQueued(input.submissionId)
  if (!submission) return { ok: false, error: toAppError("not_found", "Submission not found.") }

  const updated: Submission = { ...submission, status: "admin_review", moderatorNote: input.reason }
  store.moderationQueue = store.moderationQueue.filter((s) => s.id !== input.submissionId)

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

  return { ok: true, data: updated }
}
