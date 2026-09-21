"use client"

import { Megaphone } from "lucide-react"
import { toast } from "sonner"

import { campaigns } from "@/lib/mock-data"
import { formatCurrency, formatNumber } from "@/lib/format"
import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { CampaignStatusBadge } from "@/components/shared/status-badge"
import { BrandAvatar } from "@/components/shared/brand-avatar"
import { PlatformIcon } from "@/components/shared/platform-icon"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { useT } from "@/components/i18n/locale-provider"

export function AdminCampaignsView() {
  const t = useT()
  const totalBudget = campaigns.reduce((s, c) => s + c.budget, 0)
  const totalViews = campaigns.reduce((s, c) => s + c.views, 0)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("adminCampaigns.title")} description={t("adminCampaigns.description")} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={t("adminCampaigns.totalCampaigns")} value={campaigns.length} icon={Megaphone} />
        <StatCard label={t("adminCampaigns.totalBudget")} value={formatCurrency(totalBudget)} />
        <StatCard label={t("adminCampaigns.combinedViews")} value={formatNumber(totalViews)} />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("adminCampaigns.campaign")}</TableHead>
                <TableHead>{t("adminCampaigns.advertiser")}</TableHead>
                <TableHead>{t("adminCampaigns.platforms")}</TableHead>
                <TableHead className="text-right">{t("adminCampaigns.budget")}</TableHead>
                <TableHead className="text-right">{t("adminCampaigns.views")}</TableHead>
                <TableHead>{t("adminCampaigns.status")}</TableHead>
                <TableHead className="text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <BrandAvatar name={c.brand} src={c.cover} className="size-9" />
                      <span className="font-medium">{c.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.brand}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {c.platforms.map((p) => (
                        <PlatformIcon key={p} platform={p} className="size-4" />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatCurrency(c.budget)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatNumber(c.views)}</TableCell>
                  <TableCell>
                    <CampaignStatusBadge status={c.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontal />
                          <span className="sr-only">{t("adminCampaigns.actions")}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                          <DropdownMenuItem onClick={() => toast.info(t("adminCampaigns.viewingToast", { title: c.title }))}>
                            {t("adminCampaigns.view")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => toast.warning(t("adminCampaigns.pausedToast", { title: c.title }))}
                          >
                            {t("adminCampaigns.pause")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => toast.error(t("adminCampaigns.suspendedToast", { title: c.title }))}
                          >
                            {t("adminCampaigns.suspend")}
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
