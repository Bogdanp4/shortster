"use client"

import { useMemo, useState } from "react"
import { campaigns } from "@/lib/mock-data"
import { useApp } from "@/components/app/app-provider"
import { useT } from "@/components/i18n/locale-provider"
import { PageHeader } from "@/components/shared/page-header"
import { CampaignCard } from "@/components/shared/campaign-card"
import { StatCard } from "@/components/shared/stat-card"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/ui/input-group"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { Search, Megaphone, DollarSign, Eye, SearchX, Link2, ArrowRight } from "lucide-react"
import { compactNumber, formatMoney } from "@/lib/format"

const categories: { value: string; labelKey: string }[] = [
  { value: "all", labelKey: "discover.catAll" },
  { value: "clipping", labelKey: "discover.catClipping" },
  { value: "logo", labelKey: "discover.catLogo" },
  { value: "video_banner", labelKey: "discover.catVideoBanner" },
  { value: "music", labelKey: "discover.catMusic" },
]

export function DiscoverView() {
  const t = useT()
  const { socialAccounts, navigate } = useApp()
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("all")
  const [bannerDismissed, setBannerDismissed] = useState(false)

  const hasVerifiedAccount = socialAccounts.some((a) => a.status === "verified")
  const showConnectBanner = !hasVerifiedAccount && !bannerDismissed

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
  const activeBudgetRemaining = activeCampaigns.reduce(
    (sum, c) => sum + Math.max(0, c.creatorBudgetMinor - c.creatorBudgetSpentMinor),
    0,
  )
  const totalViews = campaigns.reduce((sum, c) => sum + c.views, 0)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("creator.discoverTitle")} description={t("creator.discoverDescription")} />

      {showConnectBanner && (
        <Alert>
          <Link2 className="size-4" />
          <AlertTitle>{t("creator.connectBannerTitle")}</AlertTitle>
          <AlertDescription className="flex flex-col gap-3">
            <span>{t("creator.connectBannerBody")}</span>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => navigate("social")}>
                {t("creator.addAccount")}
                <ArrowRight data-icon="inline-end" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setBannerDismissed(true)}>
                {t("creator.dismiss")}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={t("discover.statActive")} value={String(activeCampaigns.length)} icon={Megaphone} accent="brand" hint={t("discover.statActiveHint")} />
        <StatCard label={t("discover.statBudget")} value={formatMoney(activeBudgetRemaining, { compact: true })} icon={DollarSign} accent="success" hint={t("discover.statBudgetHint")} />
        <StatCard label={t("discover.statViews")} value={compactNumber(totalViews)} icon={Eye} hint={t("discover.statViewsHint")} />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <InputGroup className="sm:max-w-xs">
          <InputGroupInput
            placeholder={t("discover.searchPlaceholder")}
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
              {t(c.labelKey)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {filtered.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <SearchX className="size-8 text-muted-foreground" />
            <EmptyTitle>{t("discover.emptyTitle")}</EmptyTitle>
            <EmptyDescription>{t("discover.emptyBody")}</EmptyDescription>
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
