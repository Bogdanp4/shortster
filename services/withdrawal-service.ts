import { MIN_WITHDRAWAL_MINOR } from "@/lib/config"
import { toAppError } from "@/lib/errors"
import type { CreatorWallet, WalletTransaction } from "@/lib/types"
import { formatCurrency } from "@/lib/format"
import { generateReference, mockDelay, store, todayLabel } from "./store"
import type { CreateWithdrawalInput, Result } from "./types"

export interface WithdrawalResult {
  transaction: WalletTransaction
  wallet: CreatorWallet
}

/**
 * Validates and processes a creator's crypto payout request. Balance and
 * minimum-withdrawal checks happen here — never in dialog components — so
 * every call site gets the same guarantees.
 */
export async function createCryptoWithdrawal(input: CreateWithdrawalInput): Promise<Result<WithdrawalResult>> {
  await mockDelay()

  if (input.amountMinor <= 0) {
    return { ok: false, error: toAppError("validation_error", "Withdrawal amount must be positive.") }
  }
  if (input.amountMinor < MIN_WITHDRAWAL_MINOR) {
    return {
      ok: false,
      error: toAppError("below_min_withdrawal", `Minimum withdrawal is ${formatCurrency(MIN_WITHDRAWAL_MINOR)}.`),
    }
  }
  if (input.amountMinor > store.creatorWallet.availableMinor) {
    return { ok: false, error: toAppError("insufficient_budget", "Insufficient available balance.") }
  }

  const method = store.payoutMethods.find((m) => m.id === input.payoutMethodId)
  if (!method) {
    return { ok: false, error: toAppError("not_found", "Payout method not found.", "payoutMethodId") }
  }

  const transaction: WalletTransaction = {
    id: `tx-${Date.now()}`,
    date: todayLabel(),
    type: "Withdrawal",
    description: `${method.asset} payout · ${method.label}`,
    amountMinor: -Math.abs(input.amountMinor),
    status: "pending",
    reference: generateReference("WD"),
  }

  store.creatorTransactions = [transaction, ...store.creatorTransactions]
  store.creatorWallet = {
    ...store.creatorWallet,
    availableMinor: store.creatorWallet.availableMinor - input.amountMinor,
  }

  return { ok: true, data: { transaction, wallet: store.creatorWallet } }
}
