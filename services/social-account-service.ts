import { toAppError } from "@/lib/errors"
import type { SocialAccount } from "@/lib/types"
import { mockDelay, store } from "./store"
import type { Result } from "./types"

export async function getAccounts(): Promise<Result<SocialAccount[]>> {
  await mockDelay()
  return { ok: true, data: store.socialAccounts }
}

export async function addAccount(account: SocialAccount): Promise<Result<SocialAccount>> {
  await mockDelay()
  store.socialAccounts = [...store.socialAccounts, account]
  return { ok: true, data: account }
}

export async function updateAccount(id: string, patch: Partial<SocialAccount>): Promise<Result<SocialAccount>> {
  await mockDelay()
  let updated: SocialAccount | undefined
  store.socialAccounts = store.socialAccounts.map((a) => {
    if (a.id !== id) return a
    updated = { ...a, ...patch }
    return updated
  })
  if (!updated) return { ok: false, error: toAppError("not_found", "Social account not found.") }
  return { ok: true, data: updated }
}

export async function removeAccount(id: string): Promise<Result<void>> {
  await mockDelay()
  store.socialAccounts = store.socialAccounts.filter((a) => a.id !== id)
  return { ok: true, data: undefined }
}
