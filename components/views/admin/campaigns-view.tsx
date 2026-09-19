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

export function AdminCampaignsView() {
  const totalBudget = campaigns.reduce((s, c) => s + c.budget, 0)
  const totalViews = campaigns.reduce((s, c) => s + c.views, 0)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Campaigns" description="Oversee every campaign across all advertisers." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total campaigns" value={campaigns.length} icon={Megaphone} />
        <StatCard label="Total budget" value={formatCurrency(totalBudget)} />
        <StatCard label="Combined views" value={formatNumber(totalViews)} />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Advertiser</TableHead>
                <TableHead>Platforms</TableHead>
                <TableHead className="text-right">Budget</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead>Status</TableHead>
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
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                          <DropdownMenuItem onClick={() => toast.info(`Viewing ${c.title}`)}>View</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.warning(`Paused ${c.title}`)}>Pause</DropdownMenuItem>
                          <DropdownMenuItem variant="destructive" onClick={() => toast.error(`Suspended ${c.title}`)}>
                            Suspend
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
