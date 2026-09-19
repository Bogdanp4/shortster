import type {
  AdminUser,
  AdvertiserWallet,
  AuditLog,
  Campaign,
  CreatorWallet,
  DuplicateInfo,
  FraudCase,
  IgVerification,
  Notification,
  PaymentMethod,
  PayoutMethod,
  Platform,
  ResolvedVideo,
  SocialAccount,
  Submission,
  VideoCheckOutcome,
  WalletTransaction,
} from "./types"
import { extractVideoId } from "./format"

export const campaigns: Campaign[] = [
  {
    id: "stake-highlights",
    title: "Stake Highlights",
    brand: "Stake",
    category: "Clipping",
    cover: "/campaigns/stake-highlights.png",
    description:
      "Clip our biggest slot wins, tournament moments and creator reactions into punchy short-form edits. We reward verified views on TikTok, Reels and Shorts. Keep the energy high and the pacing fast.",
    instructions: [
      "Use raw footage from the provided asset pack or approved streams.",
      "Hook must land in the first 2 seconds.",
      "Keep clips between 15 and 45 seconds.",
      "Add the Stake logo overlay in a top corner for the full duration.",
      "End with the 'Play at Stake' call to action.",
    ],
    requirements: [
      "Minimum video length: 15 sec",
      "Logo must be visible for the full clip",
      "CTA required at the end",
      "English language only",
      "TikTok / Reels / Shorts",
      "No paid boosting or ads",
      "No fake engagement",
    ],
    status: "active",
    budget: 10000,
    spent: 2580,
    ratePerMillion: 500,
    minViews: 10000,
    maxPayoutPerAccount: 250,
    maxPayoutPerVideo: 200,
    maxSubmissionsPerAccount: 5,
    platforms: ["tiktok", "instagram", "youtube"],
    minDuration: 15,
    maxDuration: 45,
    languages: ["English"],
    countries: ["United States", "Canada", "United Kingdom", "Australia"],
    startDate: "Sep 1, 2026",
    endDate: "Oct 15, 2026",
    requiredCta: "Play at Stake",
    requiredAudio: "Original audio or approved SFX pack",
    hashtags: ["#stake", "#highlights", "#clips"],
    creators: 63,
    submissionsCount: 84,
    views: 5_100_000,
    exampleVideos: [
      { id: "ex1", title: "Insane $250k slot win", platform: "tiktok", views: 842_000, duration: 22, thumb: "/campaigns/stake-highlights.png" },
      { id: "ex2", title: "Tournament final reaction", platform: "youtube", views: 613_000, duration: 34, thumb: "/campaigns/stake-highlights.png" },
      { id: "ex3", title: "Top 5 wins this week", platform: "instagram", views: 421_000, duration: 28, thumb: "/campaigns/stake-highlights.png" },
    ],
    assets: [
      { name: "logo.png", size: "220 KB", type: "image" },
      { name: "overlay.mov", size: "18 MB", type: "video" },
      { name: "brand-guide.pdf", size: "4.1 MB", type: "pdf" },
      { name: "raw-clips.zip", size: "1.2 GB", type: "archive" },
    ],
  },
  {
    id: "gaming-clips",
    title: "Gaming Clips",
    brand: "NexusPlay",
    category: "Gaming",
    cover: "/campaigns/gaming-clips.png",
    description:
      "Turn our biggest gameplay moments into viral shorts. We are looking for clean, high-retention edits that showcase clutch plays and funny fails from the NexusPlay roster.",
    instructions: [
      "Pull from approved VOD library only.",
      "Add subtitles for spoken moments.",
      "Feature the NexusPlay watermark bottom-left.",
      "Keep it punchy — 20 to 40 seconds.",
    ],
    requirements: [
      "Minimum video length: 20 sec",
      "Watermark must be visible",
      "CTA required",
      "English or Spanish",
      "TikTok / Shorts",
      "No fake engagement",
    ],
    status: "active",
    budget: 25000,
    spent: 9120,
    ratePerMillion: 750,
    minViews: 25000,
    maxPayoutPerAccount: 500,
    maxPayoutPerVideo: 350,
    maxSubmissionsPerAccount: 8,
    platforms: ["tiktok", "youtube"],
    minDuration: 20,
    maxDuration: 40,
    languages: ["English", "Spanish"],
    countries: ["United States", "Mexico", "Spain", "Brazil"],
    startDate: "Aug 20, 2026",
    endDate: "Oct 30, 2026",
    requiredCta: "Download NexusPlay",
    hashtags: ["#gaming", "#nexusplay", "#clutch"],
    creators: 128,
    submissionsCount: 214,
    views: 12_160_000,
    exampleVideos: [
      { id: "ex1", title: "1v5 clutch ace", platform: "tiktok", views: 1_240_000, duration: 26, thumb: "/campaigns/gaming-clips.png" },
      { id: "ex2", title: "Funniest fails compilation", platform: "youtube", views: 980_000, duration: 38, thumb: "/campaigns/gaming-clips.png" },
    ],
    assets: [
      { name: "watermark.png", size: "180 KB", type: "image" },
      { name: "vod-pack.zip", size: "3.4 GB", type: "archive" },
      { name: "style-guide.pdf", size: "2.8 MB", type: "pdf" },
    ],
  },
  {
    id: "music-promotion",
    title: "Music Promotion",
    brand: "Riff Records",
    category: "Music",
    cover: "/campaigns/music-promotion.png",
    description:
      "Help our newest single go viral. Use the provided audio in your short-form content — dance, lip-sync, transitions or storytelling. Creativity is rewarded.",
    instructions: [
      "You must use the official audio track.",
      "Track should be audible for at least 10 seconds.",
      "Tag the artist in your caption.",
    ],
    requirements: [
      "Minimum video length: 10 sec",
      "Official audio required",
      "Any language",
      "TikTok / Reels",
      "No fake engagement",
    ],
    status: "active",
    budget: 5000,
    spent: 4888,
    ratePerMillion: 250,
    minViews: 5000,
    maxPayoutPerAccount: 150,
    maxPayoutPerVideo: 100,
    maxSubmissionsPerAccount: 10,
    platforms: ["tiktok", "instagram"],
    minDuration: 10,
    maxDuration: 60,
    languages: ["Any"],
    countries: ["Worldwide"],
    startDate: "Sep 10, 2026",
    endDate: "Nov 1, 2026",
    requiredCta: "Stream 'Neon Skies'",
    requiredAudio: "Neon Skies — Official Audio",
    hashtags: ["#neonskies", "#riffrecords", "#newmusic"],
    creators: 96,
    submissionsCount: 152,
    views: 4_380_000,
    exampleVideos: [
      { id: "ex1", title: "Neon Skies transition", platform: "instagram", views: 512_000, duration: 16, thumb: "/campaigns/music-promotion.png" },
      { id: "ex2", title: "Dance challenge", platform: "tiktok", views: 388_000, duration: 21, thumb: "/campaigns/music-promotion.png" },
    ],
    assets: [
      { name: "neon-skies.mp3", size: "6.2 MB", type: "audio" },
      { name: "cover-art.png", size: "1.1 MB", type: "image" },
    ],
  },
  {
    id: "ai-app-ugc",
    title: "AI App UGC",
    brand: "Lumen AI",
    category: "UGC",
    cover: "/campaigns/ai-app-ugc.png",
    description:
      "Create authentic UGC-style videos showing how you use Lumen AI in your daily workflow. Talk to camera, show the app, and highlight one feature you love.",
    instructions: [
      "Show the app screen at least once.",
      "Speak naturally — no scripts that feel like ads.",
      "Highlight a real use case.",
      "Include the download CTA.",
    ],
    requirements: [
      "Minimum video length: 25 sec",
      "App must be shown on screen",
      "Spoken CTA required",
      "English language",
      "TikTok / Reels / Shorts",
      "No fake engagement",
    ],
    status: "active",
    budget: 10000,
    spent: 4210,
    ratePerMillion: 1000,
    minViews: 15000,
    maxPayoutPerAccount: 400,
    maxPayoutPerVideo: 300,
    maxSubmissionsPerAccount: 4,
    platforms: ["tiktok", "instagram", "youtube"],
    minDuration: 25,
    maxDuration: 60,
    languages: ["English"],
    countries: ["United States", "United Kingdom", "Canada"],
    startDate: "Sep 5, 2026",
    endDate: "Oct 20, 2026",
    requiredCta: "Download Lumen AI",
    hashtags: ["#lumenai", "#aiapp", "#productivity"],
    creators: 71,
    submissionsCount: 118,
    views: 6_940_000,
    exampleVideos: [
      { id: "ex1", title: "How I plan my week with AI", platform: "tiktok", views: 720_000, duration: 41, thumb: "/campaigns/ai-app-ugc.png" },
      { id: "ex2", title: "This AI app changed my workflow", platform: "youtube", views: 540_000, duration: 52, thumb: "/campaigns/ai-app-ugc.png" },
    ],
    assets: [
      { name: "app-logo.png", size: "260 KB", type: "image" },
      { name: "b-roll.zip", size: "820 MB", type: "archive" },
      { name: "talking-points.pdf", size: "1.4 MB", type: "pdf" },
    ],
  },
  {
    id: "sports-highlights",
    title: "Sports Highlights",
    brand: "Apex Sports",
    category: "Clipping",
    cover: "/campaigns/sports-highlights.png",
    description:
      "Clip the most electric moments from this season into shareable shorts. Buzzer beaters, big hits, celebrations — we want the moments fans replay.",
    instructions: [
      "Use only licensed footage from the asset pack.",
      "Add the Apex Sports intro sting.",
      "Keep clips under 30 seconds.",
    ],
    requirements: [
      "Minimum video length: 12 sec",
      "Intro sting required",
      "English language",
      "TikTok / Reels / Shorts",
      "No fake engagement",
    ],
    status: "paused",
    budget: 15000,
    spent: 6800,
    ratePerMillion: 500,
    minViews: 20000,
    maxPayoutPerAccount: 300,
    maxPayoutPerVideo: 200,
    maxSubmissionsPerAccount: 6,
    platforms: ["tiktok", "instagram", "youtube"],
    minDuration: 12,
    maxDuration: 30,
    languages: ["English"],
    countries: ["United States", "Canada"],
    startDate: "Aug 1, 2026",
    endDate: "Sep 30, 2026",
    requiredCta: "Watch on Apex",
    hashtags: ["#apexsports", "#highlights", "#gameday"],
    creators: 54,
    submissionsCount: 97,
    views: 8_200_000,
    exampleVideos: [
      { id: "ex1", title: "Buzzer beater from half court", platform: "tiktok", views: 1_800_000, duration: 19, thumb: "/campaigns/sports-highlights.png" },
    ],
    assets: [
      { name: "intro-sting.mov", size: "12 MB", type: "video" },
      { name: "footage-pack.zip", size: "2.1 GB", type: "archive" },
    ],
  },
]

export function getCampaign(id: string): Campaign | undefined {
  return campaigns.find((c) => c.id === id)
}

export const creatorSocialAccounts: SocialAccount[] = [
  {
    id: "sa1",
    platform: "tiktok",
    handle: "@shortster",
    displayName: "Shortster",
    followers: 128400,
    method: "oauth",
    status: "verified",
    connectedAt: "Aug 12, 2026",
    verifiedAt: "Aug 12, 2026",
    lastChecked: "2h ago",
  },
  {
    id: "sa2",
    platform: "tiktok",
    handle: "@shortstergaming",
    displayName: "Shortster Gaming",
    followers: 84100,
    method: "oauth",
    status: "verified",
    connectedAt: "Aug 18, 2026",
    verifiedAt: "Aug 18, 2026",
    lastChecked: "5h ago",
  },
  {
    id: "sa3",
    platform: "youtube",
    handle: "Shortster Clips",
    displayName: "Shortster Clips",
    followers: 54200,
    method: "google",
    status: "verified",
    connectedAt: "Aug 14, 2026",
    verifiedAt: "Aug 14, 2026",
    lastChecked: "1d ago",
  },
  {
    id: "sa4",
    platform: "instagram",
    handle: "@shortsterclips",
    displayName: "Shortster Clips",
    followers: 42300,
    method: "bio_challenge",
    status: "verified",
    connectedAt: "Aug 20, 2026",
    verifiedAt: "Aug 20, 2026",
    lastChecked: "3h ago",
  },
]

export const creatorSubmissions: Submission[] = [
  {
    id: "sub-1041",
    campaignId: "stake-highlights",
    campaignTitle: "Stake Highlights",
    brand: "Stake",
    cover: "/campaigns/stake-highlights.png",
    platform: "tiktok",
    accountHandle: "@shortster",
    creatorName: "Alex Rivera",
    creatorHandle: "@shortster",
    videoUrl: "https://tiktok.com/@shortster/video/7412360912",
    videoId: "7412360912",
    thumb: "/campaigns/stake-highlights.png",
    viewsAtSubmission: 184293,
    likes: 12319,
    comments: 419,
    duration: 23,
    ratePerMillion: 500,
    reward: 92.15,
    status: "credited",
    submittedAt: "Sep 15, 2026",
    riskScore: 12,
  },
  {
    id: "sub-1042",
    campaignId: "gaming-clips",
    campaignTitle: "Gaming Clips",
    brand: "NexusPlay",
    cover: "/campaigns/gaming-clips.png",
    platform: "youtube",
    accountHandle: "Shortster Clips",
    creatorName: "Alex Rivera",
    creatorHandle: "@shortster",
    videoUrl: "https://youtube.com/shorts/kD8fH2aQ",
    videoId: "kD8fH2aQ",
    thumb: "/campaigns/gaming-clips.png",
    viewsAtSubmission: 512400,
    likes: 41200,
    comments: 980,
    duration: 31,
    ratePerMillion: 750,
    reward: 384.3,
    cappedReward: 350,
    status: "approved",
    submittedAt: "Sep 17, 2026",
    riskScore: 18,
  },
  {
    id: "sub-1043",
    campaignId: "ai-app-ugc",
    campaignTitle: "AI App UGC",
    brand: "Lumen AI",
    cover: "/campaigns/ai-app-ugc.png",
    platform: "instagram",
    accountHandle: "@shortsterclips",
    creatorName: "Alex Rivera",
    creatorHandle: "@shortster",
    videoUrl: "https://instagram.com/reel/CxYz12aB",
    videoId: "CxYz12aB",
    thumb: "/campaigns/ai-app-ugc.png",
    viewsAtSubmission: 88420,
    likes: 6120,
    comments: 210,
    duration: 42,
    ratePerMillion: 1000,
    reward: 88.42,
    status: "pending",
    submittedAt: "Sep 18, 2026",
    riskScore: 9,
  },
  {
    id: "sub-1044",
    campaignId: "music-promotion",
    campaignTitle: "Music Promotion",
    brand: "Riff Records",
    cover: "/campaigns/music-promotion.png",
    platform: "tiktok",
    accountHandle: "@shortster",
    creatorName: "Alex Rivera",
    creatorHandle: "@shortster",
    videoUrl: "https://tiktok.com/@shortster/video/7409981233",
    videoId: "7409981233",
    thumb: "/campaigns/music-promotion.png",
    viewsAtSubmission: 24100,
    likes: 1820,
    comments: 64,
    duration: 18,
    ratePerMillion: 250,
    reward: 6.03,
    status: "rejected",
    submittedAt: "Sep 12, 2026",
    moderatorNote: "Official audio was not used for the required duration.",
    riskScore: 22,
  },
  {
    id: "sub-1045",
    campaignId: "stake-highlights",
    campaignTitle: "Stake Highlights",
    brand: "Stake",
    cover: "/campaigns/stake-highlights.png",
    platform: "youtube",
    accountHandle: "Shortster Clips",
    creatorName: "Alex Rivera",
    creatorHandle: "@shortster",
    videoUrl: "https://youtube.com/shorts/9Xk2Lm",
    videoId: "9Xk2Lm",
    thumb: "/campaigns/stake-highlights.png",
    viewsAtSubmission: 342900,
    likes: 28400,
    comments: 720,
    duration: 27,
    ratePerMillion: 500,
    reward: 171.45,
    cappedReward: 200,
    status: "credited",
    submittedAt: "Sep 8, 2026",
    riskScore: 14,
  },
]

// Queue for moderators — submissions from many creators
export const moderationQueue: Submission[] = [
  {
    id: "sub-2001",
    campaignId: "stake-highlights",
    campaignTitle: "Stake Highlights",
    brand: "Stake",
    cover: "/campaigns/stake-highlights.png",
    platform: "tiktok",
    accountHandle: "@shortster",
    creatorName: "Alex Rivera",
    creatorHandle: "@shortster",
    videoUrl: "https://tiktok.com/@shortster/video/7412360912",
    videoId: "7412360912",
    thumb: "/campaigns/stake-highlights.png",
    viewsAtSubmission: 184293,
    likes: 12319,
    comments: 419,
    duration: 23,
    ratePerMillion: 500,
    reward: 92.15,
    status: "pending",
    submittedAt: "12 min ago",
    riskScore: 12,
  },
  {
    id: "sub-2002",
    campaignId: "gaming-clips",
    campaignTitle: "Gaming Clips",
    brand: "NexusPlay",
    cover: "/campaigns/gaming-clips.png",
    platform: "youtube",
    accountHandle: "ProClipz",
    creatorName: "Mia Chen",
    creatorHandle: "@miaclips",
    videoUrl: "https://youtube.com/shorts/kD8fH2aQ",
    videoId: "kD8fH2aQ",
    thumb: "/campaigns/gaming-clips.png",
    viewsAtSubmission: 512400,
    likes: 41200,
    comments: 980,
    duration: 31,
    ratePerMillion: 750,
    reward: 384.3,
    cappedReward: 350,
    status: "pending",
    submittedAt: "24 min ago",
    riskScore: 42,
  },
  {
    id: "sub-2003",
    campaignId: "music-promotion",
    campaignTitle: "Music Promotion",
    brand: "Riff Records",
    cover: "/campaigns/music-promotion.png",
    platform: "instagram",
    accountHandle: "@daniedits",
    creatorName: "Dani Vasquez",
    creatorHandle: "@daniedits",
    videoUrl: "https://instagram.com/reel/Ab12Cd",
    videoId: "Ab12Cd",
    thumb: "/campaigns/music-promotion.png",
    viewsAtSubmission: 97800,
    likes: 8400,
    comments: 190,
    duration: 22,
    ratePerMillion: 250,
    reward: 24.45,
    status: "pending",
    submittedAt: "38 min ago",
    riskScore: 8,
  },
  {
    id: "sub-2004",
    campaignId: "ai-app-ugc",
    campaignTitle: "AI App UGC",
    brand: "Lumen AI",
    cover: "/campaigns/ai-app-ugc.png",
    platform: "tiktok",
    accountHandle: "@techtok",
    creatorName: "Jordan Lee",
    creatorHandle: "@techtok",
    videoUrl: "https://tiktok.com/@techtok/video/7401228765",
    videoId: "7401228765",
    thumb: "/campaigns/ai-app-ugc.png",
    viewsAtSubmission: 43200,
    likes: 2900,
    comments: 88,
    duration: 38,
    ratePerMillion: 1000,
    reward: 43.2,
    status: "pending",
    submittedAt: "51 min ago",
    riskScore: 71,
  },
]

export const creatorTransactions: WalletTransaction[] = [
  { id: "tx-9001", date: "Sep 19, 2026", type: "Creator Reward", description: "Stake Highlights", amount: 92.15, status: "completed", reference: "SUB-1041", campaign: "Stake Highlights", submission: "sub-1041" },
  { id: "tx-9002", date: "Sep 15, 2026", type: "Creator Reward", description: "Stake Highlights", amount: 200.0, status: "completed", reference: "SUB-1045", campaign: "Stake Highlights", submission: "sub-1045" },
  { id: "tx-9003", date: "Sep 12, 2026", type: "Withdrawal", description: "Payout to PayPal", amount: -500.0, status: "completed", reference: "WD-3120" },
  { id: "tx-9004", date: "Sep 8, 2026", type: "Creator Reward", description: "Gaming Clips", amount: 128.4, status: "completed", reference: "SUB-1030", campaign: "Gaming Clips" },
  { id: "tx-9005", date: "Sep 5, 2026", type: "Adjustment", description: "Goodwill credit", amount: 15.0, status: "completed", reference: "ADJ-221" },
  { id: "tx-9006", date: "Sep 2, 2026", type: "Creator Reward", description: "AI App UGC", amount: 88.42, status: "pending", reference: "SUB-1043", campaign: "AI App UGC", submission: "sub-1043" },
]

export const creatorEarningsSeries = [
  { month: "Apr", earnings: 820 },
  { month: "May", earnings: 1240 },
  { month: "Jun", earnings: 1680 },
  { month: "Jul", earnings: 2140 },
  { month: "Aug", earnings: 2980 },
  { month: "Sep", earnings: 3760 },
]

// ADVERTISER
export const advertiserWallet: AdvertiserWallet = {
  available: 15000,
  reserved: 10000,
  totalDeposited: 45000,
  totalSpent: 24830,
}

export const advertiserTransactions: WalletTransaction[] = [
  { id: "atx-5001", date: "Sep 18, 2026", type: "Deposit", description: "Wire transfer", amount: 20000, status: "completed", reference: "DEP-8801" },
  { id: "atx-5002", date: "Sep 10, 2026", type: "Campaign Reserve", description: "Stake Highlights budget", amount: -10000, status: "completed", reference: "RES-4410", campaign: "Stake Highlights" },
  { id: "atx-5003", date: "Sep 15, 2026", type: "Campaign Spend", description: "Stake Highlights payouts", amount: -2580, status: "completed", reference: "SPD-4419", campaign: "Stake Highlights" },
  { id: "atx-5004", date: "Sep 12, 2026", type: "Refund", description: "Rejected submission reversal", amount: 46.0, status: "completed", reference: "REF-2201" },
  { id: "atx-5005", date: "Sep 2, 2026", type: "Deposit", description: "Credit card", amount: 25000, status: "completed", reference: "DEP-8720" },
]

export const advertiserStatsSeries = [
  { day: "Sep 12", views: 420000, spend: 210, submissions: 8 },
  { day: "Sep 13", views: 680000, spend: 340, submissions: 12 },
  { day: "Sep 14", views: 540000, spend: 270, submissions: 9 },
  { day: "Sep 15", views: 910000, spend: 455, submissions: 15 },
  { day: "Sep 16", views: 1200000, spend: 600, submissions: 21 },
  { day: "Sep 17", views: 980000, spend: 490, submissions: 17 },
  { day: "Sep 18", views: 1370000, spend: 685, submissions: 24 },
]

export const igVerifications: IgVerification[] = [
  { id: "igv-1", userName: "Alex Rivera", handle: "@clippername", challenge: "shortster-K7F4M2", expiresInMinutes: 42, status: "pending" },
  { id: "igv-2", userName: "Dani Vasquez", handle: "@daniedits", challenge: "shortster-9QW3ZP", expiresInMinutes: 18, status: "pending" },
  { id: "igv-3", userName: "Sam Okafor", handle: "@samshorts", challenge: "shortster-M2X8LB", expiresInMinutes: 55, status: "pending" },
]

export const fraudCases: FraudCase[] = [
  {
    id: "fr-1",
    creatorName: "Jordan Lee",
    creatorHandle: "@techtok",
    campaign: "AI App UGC",
    riskScore: 72,
    flags: [
      { points: 40, reason: "Duplicate video pattern detected across accounts" },
      { points: 20, reason: "Unusual view / engagement ratio" },
      { points: 12, reason: "Recently verified social account" },
    ],
    previousSubmissions: 14,
    rejectedSubmissions: 5,
    linkedAccounts: 4,
  },
  {
    id: "fr-2",
    creatorName: "Chris Park",
    creatorHandle: "@clipfarm",
    campaign: "Gaming Clips",
    riskScore: 88,
    flags: [
      { points: 45, reason: "Multiple accounts from same device fingerprint" },
      { points: 25, reason: "Purchased views signature" },
      { points: 18, reason: "Rapid resubmission attempts" },
    ],
    previousSubmissions: 31,
    rejectedSubmissions: 19,
    linkedAccounts: 7,
  },
]

export const notifications: Notification[] = [
  { id: "n1", title: "Submission approved", detail: "Stake Highlights", time: "2m ago", kind: "success", amount: 92.15, read: false },
  { id: "n2", title: "Instagram verified", detail: "@shortsterclips is now verified", time: "1h ago", kind: "info", read: false },
  { id: "n3", title: "Campaign almost out of budget", detail: "Music Promotion at 92% spent", time: "3h ago", kind: "warning", read: false },
  { id: "n4", title: "Submission rejected", detail: "Music Promotion — audio not used", time: "1d ago", kind: "danger", read: true },
  { id: "n5", title: "Withdrawal completed", detail: "$500.00 to PayPal", time: "2d ago", kind: "success", amount: 500, read: true },
]

export const adminUsers: AdminUser[] = [
  { id: "u1", name: "Alex Rivera", handle: "@shortster", role: "creator", status: "active", joined: "Aug 12, 2026", earnings: 14820.4 },
  { id: "u2", name: "Mia Chen", handle: "@miaclips", role: "creator", status: "active", joined: "Jul 3, 2026", earnings: 28410.0 },
  { id: "u3", name: "Stake", handle: "@stake", role: "advertiser", status: "active", joined: "Jun 20, 2026", spend: 84200 },
  { id: "u4", name: "NexusPlay", handle: "@nexusplay", role: "advertiser", status: "active", joined: "Jul 15, 2026", spend: 52100 },
  { id: "u5", name: "Jordan Lee", handle: "@techtok", role: "creator", status: "suspended", joined: "Sep 1, 2026", earnings: 210.0 },
  { id: "u6", name: "Taylor Brooks", handle: "@taylormod", role: "moderator", status: "active", joined: "May 10, 2026" },
  { id: "u7", name: "Dani Vasquez", handle: "@daniedits", role: "creator", status: "pending", joined: "Sep 16, 2026", earnings: 0 },
]

export const adminTransactions: WalletTransaction[] = [
  { id: "adm-tx1", date: "Sep 19, 2026", type: "Campaign Spend", description: "Stake → Alex Rivera", amount: -92.15, status: "completed", reference: "SPD-9001", campaign: "Stake Highlights" },
  { id: "adm-tx2", date: "Sep 18, 2026", type: "Deposit", description: "Stake wallet top-up", amount: 20000, status: "completed", reference: "DEP-8801" },
  { id: "adm-tx3", date: "Sep 18, 2026", type: "Withdrawal", description: "Mia Chen → Bank", amount: -1200, status: "pending", reference: "WD-3125" },
  { id: "adm-tx4", date: "Sep 17, 2026", type: "Campaign Reserve", description: "NexusPlay budget", amount: -25000, status: "completed", reference: "RES-4501", campaign: "Gaming Clips" },
  { id: "adm-tx5", date: "Sep 16, 2026", type: "Refund", description: "Rejected submission reversal", amount: 46, status: "completed", reference: "REF-2201" },
]

export const adminWithdrawals: WalletTransaction[] = [
  { id: "wd-1", date: "Sep 18, 2026", type: "Withdrawal", description: "Mia Chen → Bank transfer", amount: -1200, status: "pending", reference: "WD-3125" },
  { id: "wd-2", date: "Sep 12, 2026", type: "Withdrawal", description: "Alex Rivera → PayPal", amount: -500, status: "completed", reference: "WD-3120" },
  { id: "wd-3", date: "Sep 5, 2026", type: "Withdrawal", description: "Sam Okafor → Bank transfer", amount: -820, status: "completed", reference: "WD-3101" },
]

export const auditLogs: AuditLog[] = [
  { id: "al-1", actor: "Taylor Brooks", action: "Approved submission SUB-1041", target: "Alex Rivera", time: "Sep 19, 2026 14:32", category: "moderation" },
  { id: "al-2", actor: "System", action: "Reserved $10,000 for Stake Highlights", target: "Stake", time: "Sep 10, 2026 09:10", category: "financial" },
  { id: "al-3", actor: "Admin", action: "Suspended creator account", target: "Jordan Lee", time: "Sep 18, 2026 11:04", category: "account" },
  { id: "al-4", actor: "Taylor Brooks", action: "Rejected submission SUB-1044", target: "Alex Rivera", time: "Sep 12, 2026 16:20", category: "moderation" },
  { id: "al-5", actor: "System", action: "Created campaign Gaming Clips", target: "NexusPlay", time: "Aug 20, 2026 08:00", category: "campaign" },
  { id: "al-6", actor: "Admin", action: "Processed withdrawal WD-3120", target: "Alex Rivera", time: "Sep 12, 2026 10:45", category: "financial" },
]

export const adminStatsSeries = [
  { month: "Apr", gmv: 42000, revenue: 4200 },
  { month: "May", gmv: 58000, revenue: 5800 },
  { month: "Jun", gmv: 71000, revenue: 7100 },
  { month: "Jul", gmv: 94000, revenue: 9400 },
  { month: "Aug", gmv: 118000, revenue: 11800 },
  { month: "Sep", gmv: 142000, revenue: 14200 },
]

export const creatorWallet: CreatorWallet = {
  available: 1284.25,
  pending: 384.1,
  lifetime: 14820.4,
}

// Creator starts with NO payout method configured so the "Add Payout Method"
// flow is demonstrable. Adding one produces the Bank Account •••• 4821 example.
export const creatorPayoutMethods: PayoutMethod[] = []

// Advertiser starts with a saved card so deposits work immediately.
export const advertiserPaymentMethods: PaymentMethod[] = [
  { id: "pm-1", type: "card", label: "Visa", last4: "4242", detail: "Expires 08/28" },
]

export const creatorMinWithdrawal = 20

// ── Submit-flow demo fixtures ──────────────────────────────────────────────
// Video IDs already submitted anywhere on Shortster. Used for the duplicate
// check (normalized by platform video ID, not raw URL).
export const submittedVideoIndex: Record<string, DuplicateInfo> = {
  kD8fH2aQ: { campaignTitle: "Gaming Clips", submittedAt: "Sep 12, 2026", status: "approved" },
  "7409981233": { campaignTitle: "Music Promotion", submittedAt: "Sep 12, 2026", status: "rejected" },
  "9Xk2Lm": { campaignTitle: "Stake Highlights", submittedAt: "Sep 8, 2026", status: "credited" },
}

// Scripted resolution so the demo can show every outcome deterministically:
//  - a link containing "dup"   → duplicate video
//  - a link containing "wrong" → published by a different account
//  - a link containing "short" → passes but too short (fails duration check)
//  - a link containing "404" or "notfound" → not found
//  - a link containing "private" → private account
//  - anything else → a valid, campaign-ready video
export function resolveMockVideo(
  url: string,
  account: { handle: string; platform: Platform },
): { outcome: VideoCheckOutcome; video?: ResolvedVideo; duplicate?: DuplicateInfo } {
  const lower = url.toLowerCase()
  const videoId = extractVideoId(url)

  if (lower.includes("404") || lower.includes("notfound")) {
    return { outcome: "not_found" }
  }
  if (lower.includes("private")) {
    return { outcome: "private" }
  }

  const dup = submittedVideoIndex[videoId]
  if (dup || lower.includes("dup")) {
    return {
      outcome: "duplicate",
      duplicate: dup ?? { campaignTitle: "Gaming Clips", submittedAt: "Sep 12, 2026", status: "approved" },
    }
  }

  const author = lower.includes("wrong") ? "@differentcreator" : account.handle
  // Use a distinct token so it doesn't collide with the legit "/shorts/" path in YouTube URLs.
  const duration = lower.includes("tooshort") || lower.includes("brief") ? 9 : 23

  const video: ResolvedVideo = {
    videoId,
    platform: account.platform,
    authorHandle: author,
    thumb: "/campaigns/stake-highlights.png",
    views: 184293,
    likes: 12319,
    comments: 419,
    duration,
    publishedAt: "Sep 16, 2026",
    isPublic: true,
  }

  if (author !== account.handle) return { outcome: "wrong_account", video }
  return { outcome: "valid", video }
}

export const igVerificationRules = [
  "Your Instagram account must be public.",
  "Changing your username requires re-verification.",
  "Only one Shortster account can own a verified Instagram username.",
]
