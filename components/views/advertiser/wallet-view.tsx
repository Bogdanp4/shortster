"use client"

import { useState } from "react"
import { Plus, Wallet, Lock } from "lucide-react"
import { toast } from "sonner"

import { advertiserWallet, advertiserTransactions } from "@/lib/mock-data"
import { formatCurrency } from "@/lib/format"
import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { TransactionStatusBadge } from "@/components/shared/status-badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export function AdvertiserWalletView() {
  const [amount, setAmount] = useState("10000")
  const [method, setMethod] = useState("card")

  function deposit() {
    toast.success("Funds added", { description: `${formatCurrency(Number(amount) || 0)} added to your wallet.` })
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Wallet & Billing" description="Manage your balance, deposits and campaign reserves.">
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus data-icon="inline-start" />
              Add funds
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add funds</DialogTitle>
              <DialogDescription>Top up your wallet to reserve budget for campaigns.</DialogDescription>
            </DialogHeader>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="amount">Amount ($)</FieldLabel>
                <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </Field>
              <Field>
                <FieldLabel>Payment method</FieldLabel>
                <ToggleGroup
                  type="single"
                  variant="outline"
                  value={method}
                  onValueChange={(v) => v && setMethod(v)}
                  className="justify-start"
                >
                  <ToggleGroupItem value="card">Card</ToggleGroupItem>
                  <ToggleGroupItem value="wire">Wire</ToggleGroupItem>
                  <ToggleGroupItem value="crypto">Crypto</ToggleGroupItem>
                </ToggleGroup>
              </Field>
            </FieldGroup>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button onClick={deposit}>Add {formatCurrency(Number(amount) || 0)}</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Available" value={formatCurrency(advertiserWallet.available)} icon={Wallet} />
        <StatCard label="Reserved" value={formatCurrency(advertiserWallet.reserved)} icon={Lock} hint="Locked in campaigns" />
        <StatCard label="Total deposited" value={formatCurrency(advertiserWallet.totalDeposited)} />
        <StatCard label="Total spent" value={formatCurrency(advertiserWallet.totalSpent)} />
      </div>

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
              </TableRow>
            </TableHeader>
            <TableBody>
              {advertiserTransactions.map((tx) => (
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
