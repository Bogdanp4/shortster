// Single source of truth for platform constants that were previously
// duplicated or hardcoded across mock data, forms, and services. A real
// backend would likely serve most of this from an admin-configurable table;
// until then it lives here so every call site imports the same values.
import type { CampaignCategory, CryptoAsset, CryptoNetwork, Platform, VideoLanguage } from "./types"

// Shortster's fee is paid by the advertiser on top of the creator budget —
// never deducted from creator payouts.
export const DEFAULT_PLATFORM_FEE_PERCENT = 10

// Minimum withdrawal amount, in minor units (cents). $20.00.
export const MIN_WITHDRAWAL_MINOR = 2000

export const SUPPORTED_CRYPTO_ASSETS: CryptoAsset[] = ["USDT", "USDC"]

export const SUPPORTED_CRYPTO_NETWORKS: CryptoNetwork[] = ["ethereum", "tron", "bsc", "polygon", "solana"]

export const CAMPAIGN_CATEGORIES: CampaignCategory[] = ["clipping", "logo", "video_banner", "music"]

export const SUPPORTED_PLATFORMS: Platform[] = ["tiktok", "instagram", "youtube"]

export const VIDEO_LANGUAGES: VideoLanguage[] = ["any", "ru", "en", "uk"]
