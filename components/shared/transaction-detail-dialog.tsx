"use client"

import { formatCurrency } from "@/lib/format"
import { useT } from "@/components/i18n/locale-provider"
import type { WalletTransaction } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { TransactionStatusBadge } from "@/components/shared/status-badge"

export function TransactionDetailDialog({
  transaction,
  onOpenChange,
}: {
  transaction: WalletTransaction | null
  onOpenChange: (open: boolean) => void
}) {
  const t = useT()
  const positive = (transaction?.amountMinor ?? 0) >= 0

  return (
    <Dialog open={!!transaction} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {transaction && (
          <>
            <DialogHeader>
              <DialogTitle>{transaction.type}</DialogTitle>
              <DialogDescription>{transaction.description}</DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center gap-1 py-2">
              <span
                className={`text-3xl font-semibold tabular-nums ${positive ? "text-primary" : "text-foreground"}`}
              >
                {positive ? "+" : "-"}
                {formatCurrency(Math.abs(transaction.amountMinor))}
              </span>
              <TransactionStatusBadge status={transaction.status} />
            </div>

            <Separator />

            <div className="flex flex-col gap-3">
              <Row label={t("txDetail.date")} value={transaction.date} />
              {transaction.campaign && <Row label={t("txDetail.campaign")} value={transaction.campaign} />}
              {transaction.submission && (
                <Row label={t("txDetail.submission")} value={`#${transaction.submission}`} />
              )}
              <Row label={t("txDetail.transactionId")} value={transaction.reference} mono />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={mono ? "font-mono text-xs text-muted-foreground" : ""}>{value}</span>
    </div>
  )
}
