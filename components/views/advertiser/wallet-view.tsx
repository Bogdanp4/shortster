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
import { useT } from "@/components/i18n/locale-provider"

const methodIcon = { card: CreditCard, wire: Landmark, crypto: Bitcoin }

export function AdvertiserWalletView() {
  const t = useT()
  const { advertiserWallet, advertiserTransactions, paymentMethods } = useApp()
  const [depositOpen, setDepositOpen] = useState(false)
  const [addMethodOpen, setAddMethodOpen] = useState(false)
  const [detail, setDetail] = useState<WalletTransaction | null>(null)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("advWallet.title")} description={t("advWallet.description")}>
        <Button onClick={() => setDepositOpen(true)}>
          <Plus data-icon="inline-start" />
          {t("advWallet.addFunds")}
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t("advWallet.available")}
          value={formatCurrency(advertiserWallet.availableMinor)}
          icon={Wallet}
          hint={t("advWallet.availableHint")}
        />
        <StatCard
          label={t("advWallet.reserved")}
          value={formatCurrency(advertiserWallet.reservedCreatorBudgetMinor + advertiserWallet.reservedPlatformFeeMinor)}
          icon={Lock}
          hint={t("advWallet.reservedHint")}
        />
        <StatCard label={t("advWallet.totalDeposited")} value={formatCurrency(advertiserWallet.totalDepositedMinor)} />
        <StatCard label={t("advWallet.totalSpent")} value={formatCurrency(advertiserWallet.totalSpentMinor)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("advWallet.paymentMethods")}</CardTitle>
          <CardDescription>{t("advWallet.paymentMethodsDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {paymentMethods.length === 0 ? (
            <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-border p-4">
              <p className="text-sm text-muted-foreground">{t("advWallet.noPaymentMethod")}</p>
              <Button variant="secondary" size="sm" onClick={() => setAddMethodOpen(true)}>
                <Plus data-icon="inline-start" />
                {t("advWallet.addPaymentMethod")}
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
                        {m.last4 === "WIRE" ? t("advWallet.bankWire") : `•••• ${m.last4}`}
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
                <span className="text-sm font-medium">{t("advWallet.addMethod")}</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("advWallet.billingHistory")}</CardTitle>
          <CardDescription>{t("advWallet.billingHistoryDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("advWallet.date")}</TableHead>
                <TableHead>{t("advWallet.type")}</TableHead>
                <TableHead>{t("advWallet.description2")}</TableHead>
                <TableHead>{t("advWallet.reference")}</TableHead>
                <TableHead>{t("advWallet.status")}</TableHead>
                <TableHead className="text-right">{t("advWallet.amount")}</TableHead>
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
                    className={`text-right font-medium tabular-nums ${tx.amountMinor < 0 ? "text-muted-foreground" : "text-primary"}`}
                  >
                    {tx.amountMinor < 0 ? "-" : "+"}
                    {formatCurrency(Math.abs(tx.amountMinor))}
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
