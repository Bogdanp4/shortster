"use client"

import { useMemo, useState } from "react"
import { campaigns } from "@/lib/mock-data"
import type { Platform } from "@/lib/types"
import { PageHeader } from "@/components/shared/page-header"
import { CampaignCard } from "@/components/shared/campaign-card"
import { StatCard } from "@/components/shared/stat-card"
import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/ui/input-group"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { Search, Megaphone, DollarSign, Eye, SearchX } from "lucide-react"
import { compactNumber, formatMoney } from "@/lib/format"

const categories: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "clipping", label: "Clipping" },
  { value: "logo", label: "Logo" },
  { value: "video_banner", label: "Video Banner" },
  { value: "music", label: "Music" },
]

export function DiscoverView() {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("all")

  const filtered = useMemo(() => {
    return campaigns.filter((c) => {
      const matchesQuery =
        !query ||
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        c.brand.toLowerCase().includes(query.toLowerCase())
      const matchesCategory = category === "all" || c.category === category
      return matchesQuery && matchesCategory
    })
  }, [query, category])

  const activeCampaigns = campaigns.filter((c) => c.status === "active")
  const activeBudgetRemaining = activeCampaigns.reduce((sum, c) => sum + Math.max(0, c.budget - c.spent), 0)
  const totalViews = campaigns.reduce((sum, c) => sum + c.views, 0)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Discover Campaigns"
        description="Create short-form content and earn based on the views locked in at submission. New drops added weekly."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Active campaigns" value={String(activeCampaigns.length)} icon={Megaphone} accent="brand" hint="Accepting submissions now" />
        <StatCard label="Active budget remaining" value={formatMoney(activeBudgetRemaining, { compact: true })} icon={DollarSign} accent="success" hint="Across active campaigns" />
        <StatCard label="Total views driven" value={compactNumber(totalViews)} icon={Eye} hint="By all creators" />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <InputGroup className="sm:max-w-xs">
          <InputGroupInput
            placeholder="Search campaigns or brands"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>
        <ToggleGroup
          value={[category]}
          onValueChange={(v) => {
            const next = Array.isArray(v) ? v[v.length - 1] : v
            if (next) setCategory(next)
          }}
          variant="outline"
          className="flex-wrap"
        >
          {categories.map((c) => (
            <ToggleGroupItem key={c.value} value={c.value}>
              {c.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {filtered.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <SearchX className="size-8 text-muted-foreground" />
            <EmptyTitle>No campaigns found</EmptyTitle>
            <EmptyDescription>Try a different search term or category filter.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      )}
    </div>
  )
}
