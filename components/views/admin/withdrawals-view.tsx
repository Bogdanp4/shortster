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
import { useT } from "@/components/i18n/locale-provider"

export function AdminWithdrawalsView() {
  const t = useT()
  const pending = adminWithdrawals.filter((w) => w.status === "pending")
  const pendingTotal = pending.reduce((s, w) => s + Math.abs(w.amount), 0)
  const paidTotal = adminWithdrawals
    .filter((w) => w.status === "completed")
    .reduce((s, w) => s + Math.abs(w.amount), 0)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("adminWithdrawals.title")} description={t("adminWithdrawals.description")} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={t("adminWithdrawals.pendingPayouts")} value={pending.length} icon={Banknote} />
        <StatCard label={t("adminWithdrawals.pendingAmount")} value={formatCurrency(pendingTotal)} />
        <StatCard label={t("adminWithdrawals.paidThisMonth")} value={formatCurrency(paidTotal)} />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("adminWithdrawals.date")}</TableHead>
                <TableHead>{t("adminWithdrawals.description2")}</TableHead>
                <TableHead>{t("adminWithdrawals.reference")}</TableHead>
                <TableHead>{t("adminWithdrawals.status")}</TableHead>
                <TableHead className="text-right">{t("adminWithdrawals.amount")}</TableHead>
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
                      <Button
                        size="sm"
                        onClick={() => toast.success(t("adminWithdrawals.approvedToast", { reference: w.reference }))}
                      >
                        <Check data-icon="inline-start" />
                        {t("adminWithdrawals.approve")}
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">{t("adminWithdrawals.processed")}</span>
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
