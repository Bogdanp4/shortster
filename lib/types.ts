export type Role = "creator" | "advertiser" | "moderator" | "admin"

export type Platform = "tiktok" | "instagram" | "youtube"

export type SubmissionStatus =
  | "pending"
  | "approved"
  | "credited"
  | "rejected"
  | "fraud"

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

export interface SocialAccount {
  id: string
  platform: Platform
  handle: string
  displayName: string
  followers: number
  method: VerificationMethod
  status: VerificationStatus
  connectedAt: string
}

export interface Campaign {
  id: string
  title: string
  brand: string
  category: string
  cover: string
  description: string
  instructions: string[]
  requirements: string[]
  status: CampaignStatus
  budget: number
  spent: number
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
  creators: number
  submissionsCount: number
  views: number
  exampleVideos: { id: string; title: string; platform: Platform; views: number; thumb: string }[]
  assets: { name: string; size: string; type: string }[]
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
  riskScore: number
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
