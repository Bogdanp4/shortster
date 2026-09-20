import type { Platform, CampaignCategory } from "./types"

// Human labels for campaign categories.
export const categoryLabel: Record<CampaignCategory, string> = {
  clipping: "Clipping",
  logo: "Logo",
  video_banner: "Video Banner",
  music: "Music",
}

export function formatMoney(value: number, opts?: { compact?: boolean }): string {
  if (opts?.compact && Math.abs(value) >= 1000) {
    return "$" + compactNumber(value)
  }
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function formatMoneySigned(value: number): string {
  const sign = value >= 0 ? "+" : "-"
  return sign + formatMoney(Math.abs(value))
}

export function formatNumber(value: number): string {
  return value.toLocaleString("en-US")
}

// Alias kept for view components that import `formatCurrency`.
export const formatCurrency = formatMoney

export function formatRelative(input: string | number | Date): string {
  const date = input instanceof Date ? input : new Date(input)
  const time = date.getTime()
  // Some mock values are already display-ready relative labels (e.g. "12 min ago").
  // If the input can't be parsed as a date, show it as-is instead of crashing.
  if (!Number.isFinite(time)) return typeof input === "string" ? input : "—"
  const diffMs = time - Date.now()
  const abs = Math.abs(diffMs)
  const minutes = Math.round(abs / 60000)
  const hours = Math.round(abs / 3_600_000)
  const days = Math.round(abs / 86_400_000)
  const rtf = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" })
  const sign = diffMs >= 0 ? 1 : -1
  if (minutes < 60) return rtf.format(sign * minutes, "minute")
  if (hours < 24) return rtf.format(sign * hours, "hour")
  return rtf.format(sign * days, "day")
}

export function compactNumber(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return (value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1) + "M"
  }
  if (Math.abs(value) >= 1_000) {
    return (value / 1_000).toFixed(value % 1_000 === 0 ? 0 : 1) + "K"
  }
  return String(value)
}

// reward = views * (rate per 1,000,000 views)
export function computeReward(views: number, ratePerMillion: number): number {
  return (views / 1_000_000) * ratePerMillion
}

// Normalize a platform video ID from a URL so the same video posted under
// different URL shapes (youtu.be/X, youtube.com/shorts/X, watch?v=X) resolves
// to a single ID for duplicate detection.
export function extractVideoId(url: string): string {
  const clean = url.trim()
  const patterns = [
    /(?:youtube\.com\/shorts\/|youtu\.be\/|[?&]v=)([a-zA-Z0-9_-]{4,})/,
    /tiktok\.com\/@[^/]+\/video\/(\d+)/,
    /instagram\.com\/(?:reel|p)\/([a-zA-Z0-9_-]+)/,
  ]
  for (const p of patterns) {
    const m = clean.match(p)
    if (m) return m[1]
  }
  // Fall back to the last non-empty path segment.
  const seg = clean.split(/[/?#]/).filter(Boolean).pop()
  return seg ?? clean
}

export interface PayoutInput {
  views: number
  ratePerMillion: number
  maxPayoutPerVideo: number
  remainingBudget: number
}

export function calcPayout({
  views,
  ratePerMillion,
  maxPayoutPerVideo,
  remainingBudget,
}: PayoutInput) {
  const rawReward = computeReward(views, ratePerMillion)
  let finalReward = rawReward
  let limitReason: "per_video" | "budget" | null = null
  if (finalReward > maxPayoutPerVideo) {
    finalReward = maxPayoutPerVideo
    limitReason = "per_video"
  }
  if (finalReward > remainingBudget) {
    finalReward = remainingBudget
    limitReason = "budget"
  }
  return {
    views,
    ratePerMillion,
    rawReward: Number(rawReward.toFixed(2)),
    perVideoCap: maxPayoutPerVideo,
    remainingBudget,
    finalReward: Number(finalReward.toFixed(2)),
    limitReason,
  }
}

export function percent(part: number, whole: number): number {
  if (whole === 0) return 0
  return Math.min(100, Math.round((part / whole) * 100))
}

// Detect which platform a pasted video URL belongs to, so we can warn when it
// doesn't match the account/platform the creator selected. Returns null when
// the URL is empty or from an unrecognized host.
export function detectPlatformFromUrl(url: string): Platform | null {
  const u = url.trim().toLowerCase()
  if (!u) return null
  if (u.includes("tiktok.com")) return "tiktok"
  if (u.includes("instagram.com")) return "instagram"
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube"
  return null
}

// Placeholder URL shapes shown once a platform/account is chosen for submission.
export const platformUrlPlaceholder: Record<Platform, string> = {
  tiktok: "https://www.tiktok.com/@username/video/...",
  instagram: "https://www.instagram.com/reel/...",
  youtube: "https://youtube.com/shorts/...",
}

// Human labels for crypto payout networks.
export const payoutNetworkLabel: Record<string, string> = {
  ethereum: "Ethereum",
  polygon: "Polygon",
  arbitrum: "Arbitrum",
  optimism: "Optimism",
  base: "Base",
  solana: "Solana",
  tron: "Tron",
  bsc: "BNB Smart Chain",
}

// Truncate a wallet address for compact display: 0x1234…abcd
export function shortenAddress(address: string, lead = 6, tail = 4): string {
  const a = address.trim()
  if (a.length <= lead + tail + 1) return a
  return `${a.slice(0, lead)}…${a.slice(-tail)}`
}
