import type { PaymentMethod, PayoutMethod, SocialAccount } from "@/lib/types"
import { store } from "./store"

// Account-settings writes (social accounts, crypto payout methods, advertiser
// payment methods) all flow through the same mock store that the withdrawal
// and billing services read. Keeping them here — rather than in AppProvider
// React state alone — is what lets a freshly added crypto wallet or card be
// used immediately by `withdrawalService`/`billingService` without a
// "not found" error. These are synchronous because call sites add the item
// and re-render in the same tick.

export function addSocialAccount(account: SocialAccount): SocialAccount[] {
  store.socialAccounts = [...store.socialAccounts, account]
  return store.socialAccounts
}

export function updateSocialAccount(id: string, patch: Partial<SocialAccount>): SocialAccount[] {
  store.socialAccounts = store.socialAccounts.map((a) => (a.id === id ? { ...a, ...patch } : a))
  return store.socialAccounts
}

export function removeSocialAccount(id: string): SocialAccount[] {
  store.socialAccounts = store.socialAccounts.filter((a) => a.id !== id)
  return store.socialAccounts
}

export function addPayoutMethod(method: PayoutMethod): PayoutMethod[] {
  store.payoutMethods = [...store.payoutMethods, method]
  return store.payoutMethods
}

export function addPaymentMethod(method: PaymentMethod): PaymentMethod[] {
  store.paymentMethods = [...store.paymentMethods, method]
  return store.paymentMethods
}
