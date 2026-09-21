"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"

import { adminTransactions } from "@/lib/mock-data"
import { formatCurrency } from "@/lib/format"
import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { TransactionStatusBadge } from "@/components/shared/status-badge"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/ui/input-group"
import { useT } from "@/components/i18n/locale-provider"

export function AdminTransactionsView() {
  const t = useT()
  const [query, setQuery] = useState("")
  const filtered = useMemo(
    () =>
      adminTransactions.filter(
        (tx) =>
          tx.description.toLowerCase().includes(query.toLowerCase()) ||
          tx.reference.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  )

  const inflow = adminTransactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0)
  const outflow = adminTransactions.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("adminTransactions.title")} description={t("adminTransactions.description")} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={t("adminTransactions.totalInflow")} value={formatCurrency(inflow)} />
        <StatCard label={t("adminTransactions.totalOutflow")} value={formatCurrency(outflow)} />
        <StatCard label={t("adminTransactions.net")} value={formatCurrency(inflow - outflow)} />
      </div>

      <div className="flex justify-end">
        <InputGroup className="sm:max-w-xs">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            placeholder={t("adminTransactions.searchTransactions")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </InputGroup>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("adminTransactions.date")}</TableHead>
                <TableHead>{t("adminTransactions.type")}</TableHead>
                <TableHead>{t("adminTransactions.description2")}</TableHead>
                <TableHead>{t("adminTransactions.reference")}</TableHead>
                <TableHead>{t("adminTransactions.status")}</TableHead>
                <TableHead className="text-right">{t("adminTransactions.amount")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((tx) => (
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
