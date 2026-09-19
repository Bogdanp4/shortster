"use client"

import { useState } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Banknote, TrendingUp } from "lucide-react"
import { toast } from "sonner"

import { creatorWallet, creatorEarningsSeries, creatorTransactions } from "@/lib/mock-data"
import { formatCurrency } from "@/lib/format"
import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { TransactionStatusBadge } from "@/components/shared/status-badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"

const chartConfig = {
  earnings: { label: "Earnings", color: "var(--chart-1)" },
} satisfies ChartConfig

export function EarningsView() {
  const [amount, setAmount] = useState("")

  function withdraw() {
    toast.success("Withdrawal requested", {
      description: `${formatCurrency(Number(amount) || creatorWallet.available)} is being processed to your payout method.`,
    })
    setAmount("")
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Earnings" description="Your rewards, payout history and available balance.">
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Banknote data-icon="inline-start" />
              Withdraw
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Withdraw funds</DialogTitle>
              <DialogDescription>
                Available balance: {formatCurrency(creatorWallet.available)}. Payouts arrive in 1–3 business days.
              </DialogDescription>
            </DialogHeader>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="amount">Amount</FieldLabel>
                <Input
                  id="amount"
                  type="number"
                  placeholder={String(creatorWallet.available)}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </Field>
            </FieldGroup>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button onClick={withdraw}>Confirm withdrawal</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Available balance" value={formatCurrency(creatorWallet.available)} hint="Ready to withdraw" />
        <StatCard label="Pending" value={formatCurrency(creatorWallet.pending)} hint="Awaiting approval" />
        <StatCard label="Lifetime earnings" value={formatCurrency(creatorWallet.lifetime)} hint="All time" />
      </div>

      <Card>
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
                <TableHead>Reference</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {creatorTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="text-sm text-muted-foreground">{tx.date}</TableCell>
                  <TableCell className="text-sm">{tx.type}</TableCell>
                  <TableCell className="text-sm">{tx.description}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{tx.reference}</TableCell>
                  <TableCell>
                    <TransactionStatusBadge status={tx.status} />
                  </TableCell>
                  <TableCell
                    className={`text-right font-medium tabular-nums ${tx.amount < 0 ? "text-muted-foreground" : "text-primary"}`}
                  >
                    {tx.amount < 0 ? "-" : "+"}
                    {formatCurrency(Math.abs(tx.amount))}
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
