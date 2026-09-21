import { calculateCampaignReserve } from "@/lib/domain/money"
import { toAppError } from "@/lib/errors"
import type { AdvertiserWallet, Campaign, WalletTransaction } from "@/lib/types"
import { generateReference, mockDelay, store, todayLabel } from "./store"
import type { ReserveForCampaignInput, Result } from "./types"

export async function getCampaigns(): Promise<Result<Campaign[]>> {
  await mockDelay()
  return { ok: true, data: store.campaigns }
}

export async function getCampaign(id: string): Promise<Result<Campaign>> {
  await mockDelay()
  const campaign = store.campaigns.find((c) => c.id === id)
  if (!campaign) return { ok: false, error: toAppError("not_found", "Campaign not found.") }
  return { ok: true, data: campaign }
}

export interface ReserveForCampaignResult {
  transaction: WalletTransaction
  wallet: AdvertiserWallet
}

/**
 * Reserves the creator budget plus the platform fee from the advertiser
 * wallet when a campaign launches. Budget-sufficiency and the fee
 * calculation both live here instead of in the create-campaign view.
 */
export async function reserveForCampaign(input: ReserveForCampaignInput): Promise<Result<ReserveForCampaignResult>> {
  await mockDelay()

  if (input.creatorBudgetMinor <= 0) {
    return { ok: false, error: toAppError("validation_error", "Campaign budget must be positive.") }
  }

  const totalReserveMinor = calculateCampaignReserve(input.creatorBudgetMinor, input.platformFeePercent)
  const platformFeeMinor = totalReserveMinor - input.creatorBudgetMinor

  if (totalReserveMinor > store.advertiserWallet.availableMinor) {
    return {
      ok: false,
      error: toAppError("insufficient_budget", "Insufficient wallet balance to launch this campaign."),
    }
  }

  const transaction: WalletTransaction = {
    id: `atx-${Date.now()}`,
    date: todayLabel(),
    type: "Campaign Reserve",
    description: `${input.campaignTitle} budget`,
    amountMinor: -totalReserveMinor,
    status: "completed",
    reference: generateReference("RES"),
    campaign: input.campaignTitle,
  }

  store.advertiserTransactions = [transaction, ...store.advertiserTransactions]
  store.advertiserWallet = {
    ...store.advertiserWallet,
    availableMinor: store.advertiserWallet.availableMinor - totalReserveMinor,
    reservedCreatorBudgetMinor: store.advertiserWallet.reservedCreatorBudgetMinor + input.creatorBudgetMinor,
    reservedPlatformFeeMinor: store.advertiserWallet.reservedPlatformFeeMinor + platformFeeMinor,
  }

  return { ok: true, data: { transaction, wallet: store.advertiserWallet } }
}
