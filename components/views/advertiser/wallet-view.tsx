"use client"

import { useState } from "react"
import { Plus, Wallet, Lock, CreditCard, Landmark, Bitcoin, ChevronRight } from "lucide-react"

import { useApp } from "@/components/app/app-provider"
import { formatCurrency } from "@/lib/format"
import type { PaymentMethod, WalletTransaction } from "@/lib/types"
import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { TransactionStatusBadge } from "@/components/shared/status-badge"
import { TransactionDetailDialog } from "@/components/shared/transaction-detail-dialog"
import { DepositDialog } from "@/components/advertiser/deposit-dialog"
import { AddPaymentMethodDialog } from "@/components/advertiser/add-payment-method-dialog"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const methodIcon = { card: CreditCard, wire: Landmark, crypto: Bitcoin }

export function AdvertiserWalletView() {
  const { advertiserWallet, advertiserTransactions, paymentMethods } = useApp()
  const [depositOpen, setDepositOpen] = useState(false)
  const [addMethodOpen, setAddMethodOpen] = useState(false)
  const [detail, setDetail] = useState<WalletTransaction | null>(null)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Wallet & Billing" description="Manage your balance, deposits and campaign reserves.">
        <Button onClick={() => setDepositOpen(true)}>
          <Plus data-icon="inline-start" />
          Add funds
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Available" value={formatCurrency(advertiserWallet.available)} icon={Wallet} hint="Ready to reserve" />
        <StatCard label="Reserved" value={formatCurrency(advertiserWallet.reserved)} icon={Lock} hint="Locked in campaigns" />
        <StatCard label="Total deposited" value={formatCurrency(advertiserWallet.totalDeposited)} />
        <StatCard label="Total spent" value={formatCurrency(advertiserWallet.totalSpent)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment methods</CardTitle>
          <CardDescription>Funding sources for deposits</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {paymentMethods.length === 0 ? (
            <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-border p-4">
              <p className="text-sm text-muted-foreground">No payment method added</p>
              <Button variant="secondary" size="sm" onClick={() => setAddMethodOpen(true)}>
                <Plus data-icon="inline-start" />
                Add payment method
              </Button>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {paymentMethods.map((m: PaymentMethod) => {
                const Icon = methodIcon[m.type]
                return (
                  <div key={m.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <div className="flex size-9 items-center justify-center rounded-md bg-muted">
                      <Icon className="size-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{m.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {m.last4 === "WIRE" ? "Bank wire" : `•••• ${m.last4}`}
                        {m.detail ? ` · ${m.detail}` : ""}
                      </span>
                    </div>
                  </div>
                )
              })}
              <Button
                variant="outline"
                className="h-auto justify-start gap-3 border-dashed p-3"
                onClick={() => setAddMethodOpen(true)}
              >
                <div className="flex size-9 items-center justify-center rounded-md bg-muted">
                  <Plus className="size-4" />
                </div>
                <span className="text-sm font-medium">Add method</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing history</CardTitle>
          <CardDescription>Deposits, reserves, spend and refunds</CardDescription>
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
                <TableHead className="w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {advertiserTransactions.map((tx) => (
                <TableRow key={tx.id} className="cursor-pointer" onClick={() => setDetail(tx)}>
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
                  <TableCell>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <DepositDialog open={depositOpen} onOpenChange={setDepositOpen} />
      <AddPaymentMethodDialog open={addMethodOpen} onOpenChange={setAddMethodOpen} />
      <TransactionDetailDialog transaction={detail} onOpenChange={(open) => !open && setDetail(null)} />
    </div>
  )
}
