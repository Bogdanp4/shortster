import { toAppError } from "@/lib/errors"
import type { AdvertiserWallet, WalletTransaction } from "@/lib/types"
import { generateReference, mockDelay, store, todayLabel } from "./store"
import type { CreateDepositInput, Result } from "./types"

export interface DepositResult {
  transaction: WalletTransaction
  wallet: AdvertiserWallet
}

/** Credits an advertiser's wallet from a payment method. Amount/method validation lives here. */
export async function createDeposit(input: CreateDepositInput): Promise<Result<DepositResult>> {
  await mockDelay()

  if (input.amountMinor <= 0) {
    return { ok: false, error: toAppError("validation_error", "Deposit amount must be positive.") }
  }

  const method = store.paymentMethods.find((m) => m.id === input.paymentMethodId)
  if (!method) {
    return { ok: false, error: toAppError("not_found", "Payment method not found.", "paymentMethodId") }
  }

  const transaction: WalletTransaction = {
    id: `atx-${Date.now()}`,
    date: todayLabel(),
    type: "Deposit",
    description: `${method.label}${method.last4 ? ` •••• ${method.last4}` : ""}`,
    amountMinor: Math.abs(input.amountMinor),
    status: "completed",
    reference: generateReference("DEP"),
  }

  store.advertiserTransactions = [transaction, ...store.advertiserTransactions]
  store.advertiserWallet = {
    ...store.advertiserWallet,
    availableMinor: store.advertiserWallet.availableMinor + input.amountMinor,
    totalDepositedMinor: store.advertiserWallet.totalDepositedMinor + input.amountMinor,
  }

  return { ok: true, data: { transaction, wallet: store.advertiserWallet } }
}
