export type Role = "creator" | "advertiser" | "moderator" | "admin"

export type Platform = "tiktok" | "instagram" | "youtube"

// Internal campaign categories (spec: source of truth).
export type CampaignCategory = "clipping" | "logo" | "video_banner" | "music"

// How a submission's view metrics are obtained.
export type MetricsMode = "automatic" | "manual"

export type MetricsSource =
  | "tiktok_api"
  | "youtube_api"
  | "instagram_api"
  | "manual_creator_proof"
  | "manual_moderator"

export type VideoLanguage = "any" | "ru" | "en" | "uk"

export type SubmissionStatus =
  | "pending"
  | "approved"
  | "credited"
  | "rejected"
  | "admin_review"

export type CampaignStatus = "active" | "draft" | "paused" | "completed"

export type VerificationMethod = "oauth" | "google" | "bio_challenge"

export type VerificationStatus =
  | "unverified"
  | "challenge_created"
  | "pending"
  | "verified"
  | "failed"
  | "expired"
  | "revoked"

// Ownership of the social account (who controls it).
export type OwnershipStatus = "verified" | "pending" | "unverified"

// Live API/authorization connection health for the account.
export type ConnectionStatus = "connected" | "connection_required" | "not_connected"

export interface SocialAccount {
  id: string
  platform: Platform
  handle: string
  displayName: string
  followers: number
  method: VerificationMethod
  status: VerificationStatus
  // Ownership verification (BIO challenge / oauth / google).
  ownershipStatus: OwnershipStatus
  // Whether Shortster reads metrics automatically (API) or the creator declares them.
  metricsMode: MetricsMode
  // Live connection health — only "connection_required" surfaces a Reconnect action.
  connectionStatus: ConnectionStatus
  // Instagram: professional (creator/business) accounts can add an API connection.
  isProfessional?: boolean
  // Instagram: whether an automatic metrics API connection is active.
  apiConnected?: boolean
  connectedAt: string
  verifiedAt?: string
  lastChecked?: string
}

export type CryptoAsset = "USDT" | "USDC"

// Networks are configurable from Admin later — not hardcoded to one blockchain.
export type CryptoNetwork = "ethereum" | "tron" | "bsc" | "polygon" | "solana"

export interface PayoutMethod {
  id: string
  asset: CryptoAsset
  network: CryptoNetwork
  walletAddress: string
  label: string
  verified: boolean
}

export type PaymentMethodType = "card" | "wire" | "crypto"

export interface PaymentMethod {
  id: string
  type: PaymentMethodType
  label: string
  last4: string
  detail?: string
}

export interface CreatorWallet {
  available: number
  pending: number
  lifetime: number
}

export interface AdvertiserWallet {
  available: number
  reserved: number
  totalDeposited: number
  totalSpent: number
}

// Structured, moderator-checkable campaign requirements.
export interface CampaignRequirements {
  minDuration: number // seconds; 0 = no minimum
  minViews: number // 0 = no minimum
  minFollowers: number // 0 = no minimum
  language: VideoLanguage
  specificAudience: boolean
  audienceDescription?: string
  requiredHashtag?: string // normalized with leading "#"
}

export interface Campaign {
  id: string
  title: string
  brand: string
  category: CampaignCategory
  cover: string
  description: string
  instructions: string[]
  requirements: string[]
  // Structured requirements used by the create flow and moderator checklist.
  req: CampaignRequirements
  status: CampaignStatus
  budget: number
  spent: number
  // Shortster fee is paid by the advertiser (default 10%), never deducted from creators.
  feePercent: number
  ratePerMillion: number
  minViews: number
  maxPayoutPerAccount: number
  maxPayoutPerVideo: number
  maxSubmissionsPerAccount: number
  platforms: Platform[]
  minDuration: number
  maxDuration: number
  languages: string[]
  countries: string[]
  startDate: string
  endDate: string
  requiredCta: string
  requiredAudio?: string
  hashtags: string[]
  // External link (Google Drive / Dropbox / URL) to promo materials.
  promoMaterialsUrl?: string
  creators: number
  submissionsCount: number
  views: number
  exampleVideos: { id: string; title: string; platform: Platform; views: number; duration: number; thumb: string }[]
  assets: { name: string; size: string; type: string }[]
}

export interface ResolvedVideo {
  videoId: string
  platform: Platform
  authorHandle: string
  thumb: string
  views: number
  likes: number
  comments: number
  duration: number
  publishedAt: string
  isPublic: boolean
}

export type VideoCheckOutcome = "valid" | "duplicate" | "wrong_account" | "not_found" | "private"

export interface DuplicateInfo {
  campaignTitle: string
  submittedAt: string
  status: SubmissionStatus
}

export interface PayoutBreakdown {
  views: number
  ratePerMillion: number
  rawReward: number
  perVideoCap: number
  remainingBudget: number
  finalReward: number
  limitReason: "per_video" | "budget" | null
}

export interface Submission {
  id: string
  campaignId: string
  campaignTitle: string
  brand: string
  cover: string
  platform: Platform
  accountHandle: string
  creatorName: string
  creatorHandle: string
  videoUrl: string
  videoId: string
  thumb: string
  viewsAtSubmission: number
  likes: number
  comments: number
  duration: number
  ratePerMillion: number
  reward: number
  cappedReward?: number
  status: SubmissionStatus
  submittedAt: string
  moderatorNote?: string
  rejectionReason?: string
  riskScore: number
  lockedAt?: string
  // ── Verification snapshot ────────────────────────────────────────────────
  metricsMode: MetricsMode
  metricsSource: MetricsSource
  // Automatic mode: locked API views. Also mirrored into viewsAtSubmission.
  // Manual mode: creator-declared views, immutable after submission.
  claimedViews?: number
  // Manual mode: moderator-confirmed views. Never exceeds claimedViews.
  moderatorVerifiedViews?: number
  // Final payable = MIN(claimedViews, moderatorVerifiedViews) for manual.
  approvedPayableViews?: number
  followersAtSubmission?: number
  requiredHashtagPresent?: boolean
  // Manual mode proof: uploaded screenshot references (up to 3).
  proofAssets?: string[]
}

export interface WalletTransaction {
  id: string
  date: string
  type: string
  description: string
  amount: number
  status: "completed" | "pending" | "failed"
  reference: string
  campaign?: string
  submission?: string
}

export interface Notification {
  id: string
  title: string
  detail: string
  time: string
  kind: "success" | "warning" | "danger" | "info"
  amount?: number
  read: boolean
}

export interface IgVerification {
  id: string
  userName: string
  handle: string
  challenge: string
  expiresInMinutes: number
  status: VerificationStatus
}

export interface FraudCase {
  id: string
  creatorName: string
  creatorHandle: string
  campaign: string
  riskScore: number
  flags: { points: number; reason: string }[]
  previousSubmissions: number
  rejectedSubmissions: number
  linkedAccounts: number
}

export interface AdminUser {
  id: string
  name: string
  handle: string
  role: Role
  status: "active" | "suspended" | "pending"
  joined: string
  earnings?: number
  spend?: number
}

export interface AuditLog {
  id: string
  actor: string
  action: string
  target: string
  time: string
  category: "financial" | "moderation" | "account" | "campaign"
}

// ── Auth / onboarding ───────────────────────────────────────────────────────

// Roles selectable through public sign-up. Moderator/admin are assigned internally.
export type PublicRole = "creator" | "advertiser"

export type AuthStatus =
  | "registered"
  | "email_verification_required"
  | "onboarding"
  | "active"
  | "suspended"
  | "banned"

// Pre-auth / onboarding screens. Post-auth navigation uses AppProvider's `view`.
export type AuthScreen =
  | "landing"
  | "login"
  | "signup"
  | "verify-email"
  | "verify-email-success"
  | "forgot-password"
  | "forgot-password-sent"
  | "reset-password"
  | "reset-password-success"

export interface AdvertiserOnboardingProfile {
  companyName: string
  website?: string
  country?: string
  industry?: string
  logo?: string
  primaryCategory?: CampaignCategory | "any"
  primaryMarket?: string
}

export interface AuthUser {
  id: string
  email: string
  passwordHash: string
  name: string
  status: AuthStatus
  roles: Role[]
  activeWorkspace: Role
  emailVerified: boolean
  onboardingCompleted: boolean
  createdAt: string
  updatedAt: string
  advertiserProfile?: AdvertiserOnboardingProfile
}
