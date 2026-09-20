"use client"

import Image from "next/image"
import type { Campaign } from "@/lib/types"
import { formatMoney, formatNumber, percent, categoryLabel } from "@/lib/format"
import { useApp } from "@/components/app/app-provider"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { PlatformIcons } from "./platform-icon"
import { CampaignStatusBadge } from "./status-badge"
import { Eye, Wallet, TrendingUp } from "lucide-react"

export function CampaignCard({ campaign }: { campaign: Campaign }) {
  const { navigate } = useApp()
  const spentPct = percent(campaign.spent, campaign.budget)
  const remaining = campaign.budget - campaign.spent
  const remainingPct = 100 - spentPct
  const isPaused = campaign.status === "paused"
  const lowBudget = campaign.status === "active" && remainingPct <= 10

  return (
    <button
      type="button"
      onClick={() => navigate("campaign", { id: campaign.id })}
      className="group text-left"
      aria-label={`View ${campaign.title} campaign`}
    >
      <Card
        className={cn(
          "h-full overflow-hidden pt-0 transition-all hover:border-primary/40 hover:shadow-[0_0_0_1px_var(--primary)]",
          isPaused && "opacity-75",
        )}
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          <Image
            src={campaign.cover || "/placeholder.svg"}
            alt={`${campaign.title} campaign cover`}
            fill
            className={cn(
              "object-cover transition-transform duration-300 group-hover:scale-105",
              isPaused && "grayscale",
            )}
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
            <Badge variant="secondary" className="backdrop-blur-md">
              {categoryLabel[campaign.category]}
            </Badge>
            <CampaignStatusBadge status={campaign.status} />
          </div>
          {/* Payout rate is the headline number — overlay it prominently. */}
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-3 pt-10">
            <div className="flex flex-col">
              <span className="text-lg font-bold leading-none text-white">
                {formatMoney(campaign.ratePerMillion)}
              </span>
              <span className="text-[11px] text-white/70">per 1M views</span>
            </div>
            <PlatformIcons platforms={campaign.platforms} />
          </div>
        </div>

        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-col gap-0.5">
            <h3 className="font-semibold leading-tight">{campaign.title}</h3>
            <p className="text-xs text-muted-foreground">by {campaign.brand}</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Wallet className="size-3.5" />
                Budget left
              </span>
              <span className={cn("font-semibold tabular-nums", lowBudget ? "text-warning" : "text-foreground")}>
                {formatMoney(remaining, { compact: true })}
              </span>
            </div>
            <Progress value={spentPct} className={cn(lowBudget && "[&>div]:bg-warning")} />
            {lowBudget && (
              <span className="text-[11px] text-warning">Almost fully claimed — submit soon</span>
            )}
            {isPaused && (
              <span className="text-[11px] text-muted-foreground">Paused — not accepting submissions</span>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <TrendingUp className="size-3.5" />
              {formatMoney(campaign.maxPayoutPerAccount, { compact: true })} max
            </span>
            <span className="flex items-center gap-1">
              <Eye className="size-3.5" />
              {formatNumber(campaign.minViews)} min
            </span>
          </div>
        </CardContent>
      </Card>
    </button>
  )
}
