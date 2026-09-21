import { calculateCampaignReserve, calculatePlatformFee } from "@/lib/domain/money"
import { toAppError } from "@/lib/errors"
import type { AdvertiserWallet, Campaign, WalletTransaction } from "@/lib/types"
import { generateReference, mockDelay, store, todayLabel } from "./store"
import type { CreateCampaignInput, ReserveForCampaignInput, Result } from "./types"

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

export interface CreateCampaignResult {
  campaign: Campaign
  wallet: AdvertiserWallet
  transaction?: WalletTransaction
}

export interface CreateCampaignOptions {
  /**
   * `true` launches the campaign: it requires sufficient wallet balance and
   * reserves budget + platform fee. `false` (default) saves a draft and never
   * touches the wallet, even when the balance would cover it.
   */
  launch?: boolean
}

/**
 * Builds a full Campaign from the create-campaign form. Launch vs. draft is an
 * explicit caller intent, never inferred from the balance:
 *
 * - `launch: false` (default) → status `draft`, no reserve is ever taken.
 * - `launch: true` → status `active`, budget + platform fee are reserved. If
 *   the wallet cannot cover the reserve the call fails with
 *   `insufficient_budget` and nothing is created, so the advertiser can top up
 *   or save a draft instead.
 *
 * Either successful path adds the campaign to the store so it shows up
 * everywhere campaigns are listed.
 */
export async function createCampaign(
  input: CreateCampaignInput,
  opts: CreateCampaignOptions = {},
): Promise<Result<CreateCampaignResult>> {
  await mockDelay()

  if (input.creatorBudgetMinor <= 0) {
    return { ok: false, error: toAppError("validation_error", "Campaign budget must be positive.") }
  }
  if (input.platforms.length === 0) {
    return { ok: false, error: toAppError("validation_error", "Select at least one platform.") }
  }

  const launch = opts.launch ?? false
  const totalReserveMinor = calculateCampaignReserve(input.creatorBudgetMinor, input.platformFeePercent)
  const platformFeeMinor = calculatePlatformFee(input.creatorBudgetMinor, input.platformFeePercent)

  // Launching requires funding up front — reject before creating anything so a
  // launch attempt never silently downgrades to a draft.
  if (launch && totalReserveMinor > store.advertiserWallet.availableMinor) {
    return {
      ok: false,
      error: toAppError("insufficient_budget", "Insufficient wallet balance to launch this campaign."),
    }
  }

  const now = new Date()
  const end = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  const id = `camp-${Date.now()}`

  const campaign: Campaign = {
    id,
    title: input.title,
    brand: input.brand,
    category: input.category,
    cover: "/placeholder.svg",
    description: input.description,
    instructions: input.instructions,
    requirements: input.requirements,
    status: launch ? "active" : "draft",
    creatorBudgetMinor: input.creatorBudgetMinor,
    creatorBudgetSpentMinor: 0,
    platformFeePercent: input.platformFeePercent,
    ratePerMillionMinor: input.ratePerMillionMinor,
    maxPayoutPerAccountMinor: input.maxPayoutPerAccountMinor,
    maxPayoutPerVideoMinor: input.maxPayoutPerVideoMinor,
    maxSubmissionsPerAccount: input.maxSubmissionsPerAccount,
    platforms: input.platforms,
    countries: [],
    startDate: now.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
    requiredCta: "",
    optionalHashtags: [],
    promoMaterialsUrl: input.promoMaterialsUrl,
    creators: 0,
    submissionsCount: 0,
    views: 0,
    exampleVideos: [],
    assets: [],
  }

  store.campaigns = [campaign, ...store.campaigns]

  // Draft: campaign is saved but the wallet is never touched.
  if (!launch) {
    return { ok: true, data: { campaign, wallet: store.advertiserWallet } }
  }

  const transaction: WalletTransaction = {
    id: `atx-${Date.now()}`,
    date: todayLabel(),
    type: "Campaign Reserve",
    description: `${input.title} budget`,
    amountMinor: -totalReserveMinor,
    status: "completed",
    reference: generateReference("RES"),
    campaign: input.title,
  }

  store.advertiserTransactions = [transaction, ...store.advertiserTransactions]
  store.advertiserWallet = {
    ...store.advertiserWallet,
    availableMinor: store.advertiserWallet.availableMinor - totalReserveMinor,
    reservedCreatorBudgetMinor: store.advertiserWallet.reservedCreatorBudgetMinor + input.creatorBudgetMinor,
    reservedPlatformFeeMinor: store.advertiserWallet.reservedPlatformFeeMinor + platformFeeMinor,
  }

  return { ok: true, data: { campaign, wallet: store.advertiserWallet, transaction } }
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
