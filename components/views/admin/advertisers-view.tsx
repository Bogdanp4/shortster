"use client"

import { Building2 } from "lucide-react"

import { adminUsers, campaigns } from "@/lib/mock-data"
import { formatCurrency, formatNumber } from "@/lib/format"
import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { BrandAvatar } from "@/components/shared/brand-avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useT } from "@/components/i18n/locale-provider"

export function AdminAdvertisersView() {
  const t = useT()
  const advertisers = adminUsers.filter((u) => u.role === "advertiser")
  const totalSpend = advertisers.reduce((s, a) => s + (a.spendMinor ?? 0), 0)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("adminAdvertisers.title")} description={t("adminAdvertisers.description")} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={t("adminAdvertisers.totalAdvertisers")} value={advertisers.length} icon={Building2} />
        <StatCard label={t("adminAdvertisers.combinedSpend")} value={formatCurrency(totalSpend)} />
        <StatCard
          label={t("adminAdvertisers.liveCampaigns")}
          value={campaigns.filter((c) => c.status === "active").length}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("adminAdvertisers.advertiser")}</TableHead>
                <TableHead>{t("adminUsers.status")}</TableHead>
                <TableHead>{t("adminAdvertisers.joined")}</TableHead>
                <TableHead className="text-right">{t("adminAdvertisers.campaigns")}</TableHead>
                <TableHead className="text-right">{t("adminAdvertisers.totalSpend")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {advertisers.map((a) => {
                const brandCampaigns = campaigns.filter((c) => c.brand === a.name)
                return (
                  <TableRow key={a.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <BrandAvatar name={a.name} className="size-9" />
                        <div className="flex flex-col">
                          <span className="font-medium">{a.name}</span>
                          <span className="text-xs text-muted-foreground">{a.handle}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {a.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{a.joined}</TableCell>
                    <TableCell className="text-right tabular-nums">{brandCampaigns.length}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(a.spendMinor ?? 0)}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
