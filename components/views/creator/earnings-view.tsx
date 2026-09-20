"use client"

import { useState } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Banknote, Wallet, Plus, ChevronRight } from "lucide-react"

import { useApp } from "@/components/app/app-provider"
import { creatorEarningsSeries } from "@/lib/mock-data"
import { formatCurrency, payoutNetworkLabel, shortenAddress } from "@/lib/format"
import type { PayoutMethod, WalletTransaction } from "@/lib/types"
import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { TransactionStatusBadge } from "@/components/shared/status-badge"
import { TransactionDetailDialog } from "@/components/shared/transaction-detail-dialog"
import { WithdrawDialog } from "@/components/creator/withdraw-dialog"
import { AddPayoutMethodDialog } from "@/components/creator/add-payout-method-dialog"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

const chartConfig = {
  earnings: { label: "Earnings", color: "var(--chart-1)" },
} satisfies ChartConfig

export function EarningsView() {
  const { creatorWallet, creatorTransactions, payoutMethods } = useApp()
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [addMethodOpen, setAddMethodOpen] = useState(false)
  const [detail, setDetail] = useState<WalletTransaction | null>(null)

  return (
    <div className="flex flex-col gap-6 pb-20 lg:pb-0">
      <PageHeader title="Earnings" description="Your rewards, payout history and available balance.">
        <Button onClick={() => setWithdrawOpen(true)}>
          <Banknote data-icon="inline-start" />
          Withdraw funds
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Available balance" value={formatCurrency(creatorWallet.available)} hint="Ready to withdraw" />
        <StatCard label="Pending" value={formatCurrency(creatorWallet.pending)} hint="Awaiting approval" />
        <StatCard label="Lifetime earned" value={formatCurrency(creatorWallet.lifetime)} hint="All time" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Earnings over time</CardTitle>
            <CardDescription>Monthly credited rewards</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="aspect-[3/1] w-full">
              <AreaChart data={creatorEarningsSeries} margin={{ left: 12, right: 12, top: 8 }}>
                <defs>
                  <linearGradient id="fillEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-earnings)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--color-earnings)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => `$${v}`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  dataKey="earnings"
                  type="natural"
                  fill="url(#fillEarnings)"
                  stroke="var(--color-earnings)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payout method</CardTitle>
            <CardDescription>Where we send your withdrawals</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {payoutMethods.length === 0 ? (
              <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-border p-4">
                <p className="text-sm text-muted-foreground">No payout method added</p>
                <Button variant="secondary" size="sm" onClick={() => setAddMethodOpen(true)}>
                  <Plus data-icon="inline-start" />
                  Add payout method
                </Button>
              </div>
            ) : (
              <>
                {payoutMethods.map((m: PayoutMethod) => {
                  return (
                    <div key={m.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                      <div className="flex size-9 items-center justify-center rounded-md bg-muted">
                        <Wallet className="size-4" />
                      </div>
                      <div className="flex min-w-0 flex-col">
                        <span className="text-sm font-medium">{m.label}</span>
                        <span className="truncate text-xs text-muted-foreground">
                          {m.asset} · {payoutNetworkLabel[m.network] ?? m.network} · {shortenAddress(m.walletAddress)}
                        </span>
                      </div>
                      {m.verified && (
                        <Badge variant="secondary" className="ml-auto">
                          Verified
                        </Badge>
                      )}
                    </div>
                  )
                })}
                <Button variant="ghost" size="sm" className="self-start" onClick={() => setAddMethodOpen(true)}>
                  <Plus data-icon="inline-start" />
                  Add another method
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction history</CardTitle>
          <CardDescription>Rewards, adjustments and withdrawals</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {creatorTransactions.map((tx) => (
                <TableRow
                  key={tx.id}
                  className="cursor-pointer"
                  onClick={() => setDetail(tx)}
                >
                  <TableCell className="text-sm text-muted-foreground">{tx.date}</TableCell>
                  <TableCell className="text-sm">{tx.type}</TableCell>
                  <TableCell className="text-sm">{tx.description}</TableCell>
                  <TableCell>
                    <TransactionStatusBadge status={tx.status} />
                  </TableCell>
                  <TableCell
                    className={`text-right font-medium tabular-nums ${tx.amount < 0 ? "text-muted-foreground" : "text-primary"}`}
                  >
                    {tx.amount < 0 ? "-" : "+"}
                    {formatCurrency(Math.abs(tx.amount))}
                  </TableCell>
                  <TableCell>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Sticky mobile CTA */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border/60 bg-background/90 p-4 backdrop-blur-xl lg:hidden">
        <Button className="w-full" size="lg" onClick={() => setWithdrawOpen(true)}>
          <Banknote data-icon="inline-start" />
          Withdraw funds
        </Button>
      </div>

      <WithdrawDialog open={withdrawOpen} onOpenChange={setWithdrawOpen} />
      <AddPayoutMethodDialog open={addMethodOpen} onOpenChange={setAddMethodOpen} />
      <TransactionDetailDialog transaction={detail} onOpenChange={(open) => !open && setDetail(null)} />
    </div>
  )
}
