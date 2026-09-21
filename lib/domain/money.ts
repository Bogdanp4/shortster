// Integer-safe money math, operating on minor units (cents) so nothing here
// is subject to floating-point rounding drift. Display formatting stays in
// `lib/format.ts` — these helpers only compute amounts.
//
// NOTE: `lib/mock-data.ts` still stores legacy float-dollar fields today;
// these helpers are ready for the minor-units migration described in
// FRONTEND_HANDOFF.md but are not yet wired into every call site.

export interface RewardCalcInput {
  views: number
  ratePerMillionMinor: number
}

/** reward (minor units) = views * (rate per 1,000,000 views, in minor units) / 1,000,000 */
export function calculateReward({ views, ratePerMillionMinor }: RewardCalcInput): number {
  return Math.round((views * ratePerMillionMinor) / 1_000_000)
}

export interface FinalRewardInput {
  rawRewardMinor: number
  maxPayoutPerVideoMinor: number
  remainingBudgetMinor: number
}

export interface FinalRewardResult {
  finalRewardMinor: number
  limitReason: "per_video" | "budget" | null
}

/** Cap a raw reward by the per-video cap, then by remaining campaign budget. */
export function calculateFinalReward({
  rawRewardMinor,
  maxPayoutPerVideoMinor,
  remainingBudgetMinor,
}: FinalRewardInput): FinalRewardResult {
  let finalRewardMinor = rawRewardMinor
  let limitReason: "per_video" | "budget" | null = null
  if (finalRewardMinor > maxPayoutPerVideoMinor) {
    finalRewardMinor = maxPayoutPerVideoMinor
    limitReason = "per_video"
  }
  if (finalRewardMinor > remainingBudgetMinor) {
    finalRewardMinor = remainingBudgetMinor
    limitReason = "budget"
  }
  return { finalRewardMinor, limitReason }
}

/**
 * Manual verification mode: the payable view count is always the lesser of
 * the creator's declared views and the moderator-confirmed count, so
 * overstating a submission never increases payout.
 */
export function calculateManualPayableViews(claimedViews: number, moderatorVerifiedViews: number): number {
  return Math.min(claimedViews, moderatorVerifiedViews)
}

/** Platform fee, in minor units, charged to the advertiser on top of the creator budget. */
export function calculatePlatformFee(creatorBudgetMinor: number, platformFeePercent: number): number {
  return Math.round((creatorBudgetMinor * platformFeePercent) / 100)
}

/** Total amount reserved from the advertiser wallet when a campaign launches: budget + fee. */
export function calculateCampaignReserve(creatorBudgetMinor: number, platformFeePercent: number): number {
  return creatorBudgetMinor + calculatePlatformFee(creatorBudgetMinor, platformFeePercent)
}

/** Remaining creator-facing budget still available for new payouts. */
export function calculateRemainingCreatorBudget(creatorBudgetMinor: number, creatorBudgetSpentMinor: number): number {
  return Math.max(0, creatorBudgetMinor - creatorBudgetSpentMinor)
}
