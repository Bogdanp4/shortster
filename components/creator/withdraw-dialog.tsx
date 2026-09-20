"use client"

import { useMemo, useState } from "react"
import { CheckCircle2, Wallet, ArrowRight, Plus, Loader2 } from "lucide-react"

import { useApp } from "@/components/app/app-provider"
import { creatorMinWithdrawal } from "@/lib/mock-data"
import { formatCurrency } from "@/lib/format"
import type { PayoutMethod } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/ui/input-group"
import { AddPayoutMethodDialog } from "./add-payout-method-dialog"

const networkLabel: Record<string, string> = {
  ethereum: "Ethereum (ERC-20)",
  tron: "Tron (TRC-20)",
  bsc: "BNB Smart Chain (BEP-20)",
  polygon: "Polygon",
  solana: "Solana",
}

function shortenAddress(address: string) {
  return address.length > 12 ? `${address.slice(0, 6)}…${address.slice(-4)}` : address
}

type Step = "form" | "review" | "success"

export function WithdrawDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { creatorWallet, payoutMethods, creatorTransactions, withdraw, navigate } = useApp()
  const [step, setStep] = useState<Step>("form")
  const [amount, setAmount] = useState("")
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null)
  const [addMethodOpen, setAddMethodOpen] = useState(false)
  const [processing, setProcessing] = useState(false)

  const available = creatorWallet.available
  const numeric = Number(amount) || 0

  const method = useMemo(
    () => payoutMethods.find((m) => m.id === selectedMethodId) ?? payoutMethods[0] ?? null,
    [payoutMethods, selectedMethodId],
  )

  const hasPendingWithdrawal = creatorTransactions.some(
    (t) => t.type === "Withdrawal" && t.status === "pending",
  )

  let error: string | null = null
  if (amount !== "" && numeric <= 0) error = "Enter a valid amount."
  else if (numeric > available) error = "Insufficient balance. You can only withdraw your available balance."
  else if (numeric > 0 && numeric < creatorMinWithdrawal)
    error = `Minimum withdrawal is ${formatCurrency(creatorMinWithdrawal)}.`
  else if (payoutMethods.length === 0) error = "Add a payout method to continue."
  else if (method && !method.verified) error = "This payout method needs verification before you can withdraw."

  const canReview = numeric > 0 && !error && !hasPendingWithdrawal

  function setPct(pct: number) {
    const value = Math.floor(available * pct * 100) / 100
    setAmount(String(value))
  }

  function reset() {
    setStep("form")
    setAmount("")
    setSelectedMethodId(null)
    setProcessing(false)
  }

  function confirm() {
    if (!method) return
    setProcessing(true)
    setTimeout(() => {
      withdraw(numeric, method)
      setProcessing(false)
      setStep("success")
    }, 900)
  }

  function close() {
    reset()
    onOpenChange(false)
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) reset()
          onOpenChange(next)
        }}
      >
        <DialogContent className="sm:max-w-md">
          {step === "form" && (
            <>
              <DialogHeader>
                <DialogTitle>Withdraw funds</DialogTitle>
                <DialogDescription>
                  Available balance: <span className="font-medium text-foreground">{formatCurrency(available)}</span>
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-4">
                {hasPendingWithdrawal && (
                  <Alert>
                    <Loader2 />
                    <AlertTitle>Withdrawal already processing</AlertTitle>
                    <AlertDescription>
                      You have a pending withdrawal. You can start a new one once it clears.
                    </AlertDescription>
                  </Alert>
                )}

                <Field data-invalid={!!error && amount !== "" ? true : undefined}>
                  <FieldLabel htmlFor="wd-amount">Withdrawal amount</FieldLabel>
                  <InputGroup>
                    <InputGroupAddon>$</InputGroupAddon>
                    <InputGroupInput
                      id="wd-amount"
                      inputMode="decimal"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      aria-invalid={!!error && amount !== "" ? true : undefined}
                    />
                  </InputGroup>
                </Field>

                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => setPct(0.25)}>
                    25%
                  </Button>
                  <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => setPct(0.5)}>
                    50%
                  </Button>
                  <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => setPct(1)}>
                    Max
                  </Button>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Available</span>
                  <span className="tabular-nums">{formatCurrency(available)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Minimum withdrawal</span>
                  <span className="tabular-nums">{formatCurrency(creatorMinWithdrawal)}</span>
                </div>

                <Separator />

                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium">Payout method</span>
                  {payoutMethods.length === 0 ? (
                    <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-border p-4">
                      <p className="text-sm text-muted-foreground">No payout method added</p>
                      <Button variant="secondary" size="sm" onClick={() => setAddMethodOpen(true)}>
                        <Plus data-icon="inline-start" />
                        Add payout method
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {payoutMethods.map((m) => {
                        const selected = method?.id === m.id
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setSelectedMethodId(m.id)}
                            className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                              selected ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                            }`}
                          >
                            <div className="flex size-9 items-center justify-center rounded-md bg-muted">
                              <Wallet className="size-4" />
                            </div>
                            <div className="flex min-w-0 flex-col">
                              <span className="text-sm font-medium">{m.label}</span>
                              <span className="truncate text-xs text-muted-foreground">
                                {m.asset} · {networkLabel[m.network] ?? m.network} · {shortenAddress(m.walletAddress)}
                              </span>
                            </div>
                            {selected && <CheckCircle2 className="ml-auto size-4 shrink-0 text-primary" />}
                          </button>
                        )
                      })}
                      <Button variant="ghost" size="sm" className="self-start" onClick={() => setAddMethodOpen(true)}>
                        <Plus data-icon="inline-start" />
                        Add another method
                      </Button>
                    </div>
                  )}
                </div>

                {error && amount !== "" && <p className="text-sm text-destructive">{error}</p>}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={close}>
                  Cancel
                </Button>
                <Button disabled={!canReview} onClick={() => setStep("review")}>
                  Review withdrawal
                  <ArrowRight data-icon="inline-end" />
                </Button>
              </DialogFooter>
            </>
          )}

          {step === "review" && method && (
            <>
              <DialogHeader>
                <DialogTitle>Withdraw funds</DialogTitle>
                <DialogDescription>Review the details before confirming.</DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
                <Row label="Amount" value={formatCurrency(numeric)} />
                <Row label="Fee" value={formatCurrency(0)} />
                <Separator />
                <Row label="You receive" value={`${formatCurrency(numeric)} in ${method.asset}`} strong />
                <Row label="Payout wallet" value={`${method.label} · ${networkLabel[method.network] ?? method.network}`} />
                <Row label="Address" value={shortenAddress(method.walletAddress)} />
                <Row label="Balance after withdrawal" value={formatCurrency(available - numeric)} />
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setStep("form")} disabled={processing}>
                  Back
                </Button>
                <Button onClick={confirm} disabled={processing}>
                  {processing ? (
                    <>
                      <Loader2 data-icon="inline-start" className="animate-spin" />
                      Processing
                    </>
                  ) : (
                    "Confirm withdrawal"
                  )}
                </Button>
              </DialogFooter>
            </>
          )}

          {step === "success" && (
            <>
              <DialogHeader>
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/12">
                  <CheckCircle2 className="size-6 text-primary" />
                </div>
                <DialogTitle>Withdrawal requested</DialogTitle>
                <DialogDescription>Your withdrawal request has been created.</DialogDescription>
              </DialogHeader>

              <div className="flex flex-col items-center gap-1 py-2">
                <span className="text-3xl font-semibold tabular-nums">{formatCurrency(numeric)}</span>
                <span className="text-sm text-muted-foreground">
                  Status: <span className="text-foreground">Processing</span>
                </span>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    close()
                  }}
                >
                  Back to earnings
                </Button>
                <Button
                  onClick={() => {
                    close()
                    navigate("earnings")
                  }}
                >
                  View transaction
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AddPayoutMethodDialog
        open={addMethodOpen}
        onOpenChange={setAddMethodOpen}
        onAdded={(m) => setSelectedMethodId(m.id)}
      />
    </>
  )
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={strong ? "font-semibold tabular-nums" : "tabular-nums"}>{value}</span>
    </div>
  )
}
