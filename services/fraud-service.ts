import { toAppError } from "@/lib/errors"
import type { FraudCase } from "@/lib/types"
import { mockDelay, store } from "./store"
import type { ResolveFraudCaseInput, Result } from "./types"

export async function getCases(): Promise<Result<FraudCase[]>> {
  await mockDelay()
  return { ok: true, data: store.fraudCases }
}

/**
 * Resolves an open fraud case. Every action closes the case; the specific
 * side effect (suspend/ban/freeze) is applied by the caller's own domain
 * service (user management, social accounts, withdrawals) once those exist
 * — this method is the fraud-queue write path only.
 */
export async function resolveCase(input: ResolveFraudCaseInput): Promise<Result<void>> {
  await mockDelay()
  const exists = store.fraudCases.some((c) => c.id === input.caseId)
  if (!exists) return { ok: false, error: toAppError("not_found", "Fraud case not found.") }

  store.fraudCases = store.fraudCases.filter((c) => c.id !== input.caseId)
  return { ok: true, data: undefined }
}
