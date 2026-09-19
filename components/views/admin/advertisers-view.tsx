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

export function AdminAdvertisersView() {
  const advertisers = adminUsers.filter((u) => u.role === "advertiser")
  const totalSpend = advertisers.reduce((s, a) => s + (a.spend ?? 0), 0)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Advertisers" description="Brands running campaigns on the platform." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total advertisers" value={advertisers.length} icon={Building2} />
        <StatCard label="Combined spend" value={formatCurrency(totalSpend)} />
        <StatCard label="Live campaigns" value={campaigns.filter((c) => c.status === "active").length} />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Advertiser</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Campaigns</TableHead>
                <TableHead className="text-right">Total spend</TableHead>
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
                    <TableCell className="text-right tabular-nums">{formatCurrency(a.spend ?? 0)}</TableCell>
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
