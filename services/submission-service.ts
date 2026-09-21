import type { Submission } from "@/lib/types"
import { mockDelay, store } from "./store"
import type { Result } from "./types"

export async function getMySubmissions(): Promise<Result<Submission[]>> {
  await mockDelay()
  return { ok: true, data: store.submissions }
}

/**
 * Persists a newly created submission. Duplicate-video and reward-calc logic
 * currently live in the submit flow's mock video resolver
 * (`lib/mock-data.ts#resolveMockVideo`) and `lib/domain/money.ts`
 * respectively — this method is the single write path for the result.
 */
export async function createSubmission(submission: Submission): Promise<Result<Submission>> {
  await mockDelay()
  store.submissions = [submission, ...store.submissions]
  // A newly submitted (pending) video also enters the moderator review queue
  // as the same object/ID, so the creator's copy and the moderator's copy stay
  // in sync end-to-end instead of being two independent records.
  if (submission.status === "pending") {
    store.moderationQueue = [submission, ...store.moderationQueue]
  }
  return { ok: true, data: submission }
}
