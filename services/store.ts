import type {
  AdvertiserWallet,
  Campaign,
  CreatorWallet,
  FraudCase,
  Notification,
  PaymentMethod,
  PayoutMethod,
  SocialAccount,
  Submission,
  WalletTransaction,
} from "@/lib/types"
import {
  advertiserPaymentMethods as initialPaymentMethods,
  advertiserTransactions as initialAdvertiserTransactions,
  advertiserWallet as initialAdvertiserWallet,
  campaigns as initialCampaigns,
  creatorPayoutMethods as initialPayoutMethods,
  creatorSocialAccounts as initialSocialAccounts,
  creatorSubmissions as initialCreatorSubmissions,
  creatorTransactions as initialCreatorTransactions,
  creatorWallet as initialCreatorWallet,
  fraudCases as initialFraudCases,
  moderationQueue as initialModerationQueue,
  notifications as initialNotifications,
} from "@/lib/mock-data"

// Module-level mutable mock "database". A real backend replaces this module
// wholesale — every service function reads/writes only through here so
// components and call sites never touch arithmetic or array mutation
// directly.
export const store = {
  campaigns: [...initialCampaigns] as Campaign[],
  submissions: [...initialCreatorSubmissions] as Submission[],
  moderationQueue: [...initialModerationQueue] as Submission[],
  socialAccounts: [...initialSocialAccounts] as SocialAccount[],
  creatorWallet: { ...initialCreatorWallet } as CreatorWallet,
  creatorTransactions: [...initialCreatorTransactions] as WalletTransaction[],
  payoutMethods: [...initialPayoutMethods] as PayoutMethod[],
  advertiserWallet: { ...initialAdvertiserWallet } as AdvertiserWallet,
  advertiserTransactions: [...initialAdvertiserTransactions] as WalletTransaction[],
  paymentMethods: [...initialPaymentMethods] as PaymentMethod[],
  fraudCases: [...initialFraudCases] as FraudCase[],
  notifications: [...initialNotifications] as Notification[],
}

export function mockDelay(ms = 400): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function todayLabel(): string {
  return new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export function generateReference(prefix: string): string {
  return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`
}
