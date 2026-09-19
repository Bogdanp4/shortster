"use client"

import { useApp } from "./app-provider"

import { DiscoverView } from "@/components/views/creator/discover-view"
import { CampaignDetailView } from "@/components/views/creator/campaign-detail-view"
import { SubmitView } from "@/components/views/creator/submit-view"
import { SubmissionsView } from "@/components/views/creator/submissions-view"
import { SubmissionDetailView } from "@/components/views/creator/submission-detail-view"
import { EarningsView } from "@/components/views/creator/earnings-view"
import { SocialAccountsView } from "@/components/views/creator/social-accounts-view"

import { AdvertiserOverviewView } from "@/components/views/advertiser/overview-view"
import { AdvertiserCampaignsView } from "@/components/views/advertiser/campaigns-view"
import { AdvertiserCampaignDetailView } from "@/components/views/advertiser/campaign-detail-view"
import { CreateCampaignView } from "@/components/views/advertiser/create-campaign-view"
import { AdvertiserSubmissionsView } from "@/components/views/advertiser/submissions-view"
import { AdvertiserAnalyticsView } from "@/components/views/advertiser/analytics-view"
import { AdvertiserWalletView } from "@/components/views/advertiser/wallet-view"
import { AdvertiserTeamView } from "@/components/views/advertiser/team-view"
import { AdvertiserSettingsView } from "@/components/views/advertiser/settings-view"

import { ReviewQueueView } from "@/components/views/moderator/review-queue-view"
import { ReviewDetailView } from "@/components/views/moderator/review-detail-view"
import { IgVerificationView } from "@/components/views/moderator/ig-verification-view"
import { FraudReviewView } from "@/components/views/moderator/fraud-review-view"
import { ModerationHistoryView } from "@/components/views/moderator/history-view"

import { AdminDashboardView } from "@/components/views/admin/dashboard-view"
import { AdminUsersView } from "@/components/views/admin/users-view"
import { AdminAdvertisersView } from "@/components/views/admin/advertisers-view"
import { AdminCampaignsView } from "@/components/views/admin/campaigns-view"
import { AdminSubmissionsView } from "@/components/views/admin/submissions-view"
import { AdminModeratorsView } from "@/components/views/admin/moderators-view"
import { AdminTransactionsView } from "@/components/views/admin/transactions-view"
import { AdminWithdrawalsView } from "@/components/views/admin/withdrawals-view"
import { AdminFraudView } from "@/components/views/admin/fraud-view"
import { AdminAuditView } from "@/components/views/admin/audit-view"

const registry: Record<string, () => React.JSX.Element> = {
  // creator
  discover: DiscoverView,
  campaign: CampaignDetailView,
  submit: SubmitView,
  submissions: SubmissionsView,
  submission: SubmissionDetailView,
  earnings: EarningsView,
  social: SocialAccountsView,
  // advertiser
  overview: AdvertiserOverviewView,
  campaigns: AdvertiserCampaignsView,
  "adv-campaign": AdvertiserCampaignDetailView,
  create: CreateCampaignView,
  "adv-submissions": AdvertiserSubmissionsView,
  analytics: AdvertiserAnalyticsView,
  wallet: AdvertiserWalletView,
  team: AdvertiserTeamView,
  "adv-settings": AdvertiserSettingsView,
  // moderator
  queue: ReviewQueueView,
  review: ReviewDetailView,
  "ig-verify": IgVerificationView,
  fraud: FraudReviewView,
  history: ModerationHistoryView,
  // admin
  dashboard: AdminDashboardView,
  users: AdminUsersView,
  advertisers: AdminAdvertisersView,
  "admin-campaigns": AdminCampaignsView,
  "admin-submissions": AdminSubmissionsView,
  moderators: AdminModeratorsView,
  transactions: AdminTransactionsView,
  withdrawals: AdminWithdrawalsView,
  "admin-fraud": AdminFraudView,
  audit: AdminAuditView,
}

export function ViewRouter() {
  const { view } = useApp()
  const Component = registry[view] ?? DiscoverView
  return <Component />
}
