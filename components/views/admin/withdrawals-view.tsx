"use client"

import { Check, Banknote } from "lucide-react"
import { toast } from "sonner"

import { adminWithdrawals } from "@/lib/mock-data"
import { formatCurrency } from "@/lib/format"
import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { TransactionStatusBadge } from "@/components/shared/status-badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function AdminWithdrawalsView() {
  const pending = adminWithdrawals.filter((w) => w.status === "pending")
  const pendingTotal = pending.reduce((s, w) => s + Math.abs(w.amount), 0)
  const paidTotal = adminWithdrawals
    .filter((w) => w.status === "completed")
    .reduce((s, w) => s + Math.abs(w.amount), 0)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Withdrawals" description="Review and process creator withdrawal requests." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Pending payouts" value={pending.length} icon={Banknote} />
        <StatCard label="Pending amount" value={formatCurrency(pendingTotal)} />
        <StatCard label="Paid this month" value={formatCurrency(paidTotal)} />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {adminWithdrawals.map((w) => (
                <TableRow key={w.id}>
                  <TableCell className="text-sm text-muted-foreground">{w.date}</TableCell>
                  <TableCell className="text-sm">{w.description}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{w.reference}</TableCell>
                  <TableCell>
                    <TransactionStatusBadge status={w.status} />
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatCurrency(Math.abs(w.amount))}
                  </TableCell>
                  <TableCell className="text-right">
                    {w.status === "pending" ? (
                      <Button size="sm" onClick={() => toast.success(`Approved ${w.reference}`)}>
                        <Check data-icon="inline-start" />
                        Approve
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">Processed</span>
                    )}
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
