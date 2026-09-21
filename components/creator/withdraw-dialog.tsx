"use client"

import { useMemo, useState } from "react"
import { CheckCircle2, Wallet, ArrowRight, Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { useApp } from "@/components/app/app-provider"
import { useT } from "@/components/i18n/locale-provider"
import { MIN_WITHDRAWAL_MINOR } from "@/lib/config"
import { formatCurrency, payoutNetworkLabel } from "@/lib/format"
import { getErrorMessage } from "@/lib/errors"
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
  const t = useT()
  const [step, setStep] = useState<Step>("form")
  const [amount, setAmount] = useState("")
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null)
  const [addMethodOpen, setAddMethodOpen] = useState(false)
  const [processing, setProcessing] = useState(false)

  const availableMinor = creatorWallet.availableMinor
  const numericMinor = Math.round((Number(amount) || 0) * 100)

  const method = useMemo(
    () => payoutMethods.find((m) => m.id === selectedMethodId) ?? payoutMethods[0] ?? null,
    [payoutMethods, selectedMethodId],
  )

  const hasPendingWithdrawal = creatorTransactions.some(
    (t) => t.type === "Withdrawal" && t.status === "pending",
  )

  let error: string | null = null
  if (amount !== "" && numericMinor <= 0) error = t("withdrawDialog.invalidAmount")
  else if (numericMinor > availableMinor) error = t("withdrawDialog.insufficientBalance")
  else if (numericMinor > 0 && numericMinor < MIN_WITHDRAWAL_MINOR)
    error = t("withdrawDialog.minWithdrawalError", { amount: formatCurrency(MIN_WITHDRAWAL_MINOR) })
  else if (payoutMethods.length === 0) error = t("withdrawDialog.addMethodToContinue")
  else if (method && !method.verified) error = t("withdrawDialog.needsVerification")

  const canReview = numericMinor > 0 && !error && !hasPendingWithdrawal

  function setPct(pct: number) {
    const valueMinor = Math.floor(availableMinor * pct)
    setAmount((valueMinor / 100).toString())
  }

  function reset() {
    setStep("form")
    setAmount("")
    setSelectedMethodId(null)
    setProcessing(false)
  }

  async function confirm() {
    if (!method) return
    setProcessing(true)
    try {
      await withdraw(numericMinor, method)
      setStep("success")
    } catch (e) {
      toast.error(getErrorMessage(e))
    } finally {
      setProcessing(false)
    }
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
                <DialogTitle>{t("withdrawDialog.withdrawFunds")}</DialogTitle>
                <DialogDescription>
                  {t("withdrawDialog.availableBalance")}:{" "}
                  <span className="font-medium text-foreground">{formatCurrency(availableMinor)}</span>
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-4">
                {hasPendingWithdrawal && (
                  <Alert>
                    <Loader2 />
                    <AlertTitle>{t("withdrawDialog.pendingTitle")}</AlertTitle>
                    <AlertDescription>{t("withdrawDialog.pendingDesc")}</AlertDescription>
                  </Alert>
                )}

                <Field data-invalid={!!error && amount !== "" ? true : undefined}>
                  <FieldLabel htmlFor="wd-amount">{t("withdrawDialog.withdrawalAmount")}</FieldLabel>
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
                    {t("withdrawDialog.max")}
                  </Button>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("withdrawDialog.available")}</span>
                  <span className="tabular-nums">{formatCurrency(availableMinor)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("withdrawDialog.minWithdrawal")}</span>
                  <span className="tabular-nums">{formatCurrency(MIN_WITHDRAWAL_MINOR)}</span>
                </div>

                <Separator />

                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium">{t("withdrawDialog.payoutMethod")}</span>
                  {payoutMethods.length === 0 ? (
                    <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-border p-4">
                      <p className="text-sm text-muted-foreground">{t("withdrawDialog.noMethodAdded")}</p>
                      <Button variant="secondary" size="sm" onClick={() => setAddMethodOpen(true)}>
                        <Plus data-icon="inline-start" />
                        {t("withdrawDialog.addPayoutMethod")}
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
                                {m.asset} · {payoutNetworkLabel[m.network] ?? m.network} · {shortenAddress(m.walletAddress)}
                              </span>
                            </div>
                            {selected && <CheckCircle2 className="ml-auto size-4 shrink-0 text-primary" />}
                          </button>
                        )
                      })}
                      <Button variant="ghost" size="sm" className="self-start" onClick={() => setAddMethodOpen(true)}>
                        <Plus data-icon="inline-start" />
                        {t("withdrawDialog.addAnotherMethod")}
                      </Button>
                    </div>
                  )}
                </div>

                {error && amount !== "" && <p className="text-sm text-destructive">{error}</p>}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={close}>
                  {t("common.cancel")}
                </Button>
                <Button disabled={!canReview} onClick={() => setStep("review")}>
                  {t("withdrawDialog.reviewWithdrawal")}
                  <ArrowRight data-icon="inline-end" />
                </Button>
              </DialogFooter>
            </>
          )}

          {step === "review" && method && (
            <>
              <DialogHeader>
                <DialogTitle>{t("withdrawDialog.withdrawFunds")}</DialogTitle>
                <DialogDescription>{t("withdrawDialog.reviewDetails")}</DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
                <Row label={t("withdrawDialog.amount")} value={formatCurrency(numericMinor)} />
                <Row label={t("withdrawDialog.fee")} value={formatCurrency(0)} />
                <Separator />
                <Row
                  label={t("withdrawDialog.youReceive")}
                  value={`${formatCurrency(numericMinor)} in ${method.asset}`}
                  strong
                />
                <Row
                  label={t("withdrawDialog.payoutWallet")}
                  value={`${method.label} · ${payoutNetworkLabel[method.network] ?? method.network}`}
                />
                <Row label={t("withdrawDialog.address")} value={shortenAddress(method.walletAddress)} />
                <Row
                  label={t("withdrawDialog.balanceAfterWithdrawal")}
                  value={formatCurrency(availableMinor - numericMinor)}
                />
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setStep("form")} disabled={processing}>
                  {t("withdrawDialog.back")}
                </Button>
                <Button onClick={confirm} disabled={processing}>
                  {processing ? (
                    <>
                      <Loader2 data-icon="inline-start" className="animate-spin" />
                      {t("withdrawDialog.processing")}
                    </>
                  ) : (
                    t("withdrawDialog.confirmWithdrawal")
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
                <DialogTitle>{t("withdrawDialog.withdrawalRequested")}</DialogTitle>
                <DialogDescription>{t("withdrawDialog.requestCreated")}</DialogDescription>
              </DialogHeader>

              <div className="flex flex-col items-center gap-1 py-2">
                <span className="text-3xl font-semibold tabular-nums">{formatCurrency(numericMinor)}</span>
                <span className="text-sm text-muted-foreground">
                  {t("withdrawDialog.status")}: <span className="text-foreground">{t("withdrawDialog.processing")}</span>
                </span>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    close()
                  }}
                >
                  {t("withdrawDialog.backToEarnings")}
                </Button>
                <Button
                  onClick={() => {
                    close()
                    navigate("earnings")
                  }}
                >
                  {t("withdrawDialog.viewTransaction")}
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
