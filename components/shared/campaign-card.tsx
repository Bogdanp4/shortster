"use client"

import Image from "next/image"
import type { Campaign } from "@/lib/types"
import { formatMoney, formatNumber, compactNumber, percent } from "@/lib/format"
import { useApp } from "@/components/app/app-provider"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { PlatformIcons } from "./platform-icon"
import { CampaignStatusBadge } from "./status-badge"
import { Eye, Users, DollarSign } from "lucide-react"

export function CampaignCard({ campaign }: { campaign: Campaign }) {
  const { navigate } = useApp()
  const spentPct = percent(campaign.spent, campaign.budget)

  return (
    <button
      type="button"
      onClick={() => navigate("campaign", { id: campaign.id })}
      className="group text-left"
    >
      <Card className="h-full overflow-hidden pt-0 transition-all hover:border-primary/40 hover:shadow-[0_0_0_1px_var(--primary)]">
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          <Image
            src={campaign.cover || "/placeholder.svg"}
            alt={`${campaign.title} campaign cover`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
            <Badge variant="secondary" className="backdrop-blur-md">
              {campaign.category}
            </Badge>
            <CampaignStatusBadge status={campaign.status} />
          </div>
          <div className="absolute inset-x-0 bottom-0 flex items-center gap-1.5 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
            <PlatformIcons platforms={campaign.platforms} />
          </div>
        </div>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold leading-tight">{campaign.title}</h3>
              <span className="shrink-0 rounded-md bg-primary/12 px-2 py-0.5 text-xs font-semibold text-primary">
                {formatMoney(campaign.ratePerMillion)}/M
              </span>
            </div>
            <p className="text-xs text-muted-foreground">by {campaign.brand}</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {formatMoney(campaign.spent, { compact: true })} of {formatMoney(campaign.budget, { compact: true })}
              </span>
              <span className="font-medium">{spentPct}%</span>
            </div>
            <Progress value={spentPct} />
          </div>

          <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="size-3.5" />
              {compactNumber(campaign.views)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="size-3.5" />
              {formatNumber(campaign.creators)}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="size-3.5" />
              {formatMoney(campaign.maxPayoutPerAccount, { compact: true })} max
            </span>
          </div>
        </CardContent>
      </Card>
    </button>
  )
}
