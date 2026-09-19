import { cn } from "@/lib/utils"
import { Music2, Camera, Play } from "lucide-react"
import type { Platform } from "@/lib/types"

const map: Record<Platform, { icon: typeof Music2; label: string; shortLabel: string; className: string }> = {
  tiktok: { icon: Music2, label: "TikTok", shortLabel: "TikTok", className: "text-foreground" },
  instagram: { icon: Camera, label: "Instagram Reels", shortLabel: "Reels", className: "text-chart-5" },
  youtube: { icon: Play, label: "YouTube Shorts", shortLabel: "Shorts", className: "text-destructive" },
}

export function PlatformIcon({ platform, className }: { platform: Platform; className?: string }) {
  const { icon: Icon, className: color } = map[platform]
  return <Icon className={cn("size-4", color, className)} aria-hidden />
}

export function platformLabel(platform: Platform) {
  return map[platform].label
}

export function platformShortLabel(platform: Platform) {
  return map[platform].shortLabel
}

export function PlatformIcons({ platforms }: { platforms: Platform[] }) {
  return (
    <div className="flex items-center gap-1.5">
      {platforms.map((p) => (
        <PlatformIcon key={p} platform={p} />
      ))}
    </div>
  )
}
