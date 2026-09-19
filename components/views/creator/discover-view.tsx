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

const categories = ["All", "Clipping", "Gaming", "Music", "UGC"]

export function DiscoverView() {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("All")

  const filtered = useMemo(() => {
    return campaigns.filter((c) => {
      const matchesQuery =
        !query ||
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        c.brand.toLowerCase().includes(query.toLowerCase())
      const matchesCategory = category === "All" || c.category === category
      return matchesQuery && matchesCategory
    })
  }, [query, category])

  const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget - c.spent), 0)
  const totalViews = campaigns.reduce((sum, c) => sum + c.views, 0)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Discover Campaigns"
        description="Browse active campaigns, clip content, and earn per verified view. New drops added weekly."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Live campaigns" value={String(campaigns.filter((c) => c.status === "active").length)} icon={Megaphone} accent="brand" />
        <StatCard label="Budget available" value={formatMoney(totalBudget, { compact: true })} icon={DollarSign} accent="success" hint="Across all campaigns" />
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
          type="single"
          value={category}
          onValueChange={(v) => v && setCategory(v)}
          variant="outline"
          className="flex-wrap"
        >
          {categories.map((c) => (
            <ToggleGroupItem key={c} value={c}>
              {c}
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
