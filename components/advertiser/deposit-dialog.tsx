"use client"

import { useMemo, useState } from "react"
import { CheckCircle2, CreditCard, Landmark, Bitcoin, ArrowRight, Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { useApp } from "@/components/app/app-provider"
import { useT } from "@/components/i18n/locale-provider"
import { formatCurrency } from "@/lib/format"
import { getErrorMessage } from "@/lib/errors"
import type { PaymentMethod } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"
import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/ui/input-group"
import { AddPaymentMethodDialog } from "./add-payment-method-dialog"

const methodIcon = { card: CreditCard, wire: Landmark, crypto: Bitcoin }
const presets = [500, 1000, 5000]
const MIN_DEPOSIT = 100
const MIN_DEPOSIT_MINOR = MIN_DEPOSIT * 100

type Step = "form" | "review" | "success"

export function DepositDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { advertiserWallet, paymentMethods, deposit } = useApp()
  const t = useT()
  const [step, setStep] = useState<Step>("form")
  const [amount, setAmount] = useState("")
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null)
  const [addMethodOpen, setAddMethodOpen] = useState(false)
  const [processing, setProcessing] = useState(false)

  const numeric = Number(amount) || 0
  const numericMinor = Math.round(numeric * 100)
  const method = useMemo(
    () => paymentMethods.find((m) => m.id === selectedMethodId) ?? paymentMethods[0] ?? null,
    [paymentMethods, selectedMethodId],
  )

  let error: string | null = null
  if (amount !== "" && numeric <= 0) error = t("depositDialog.invalidAmount")
  else if (numeric > 0 && numeric < MIN_DEPOSIT)
    error = t("depositDialog.minDeposit", { amount: formatCurrency(MIN_DEPOSIT_MINOR) })
  else if (paymentMethods.length === 0) error = t("depositDialog.addMethodToContinue")

  const canReview = numeric >= MIN_DEPOSIT && !error

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
      await deposit(numericMinor, method)
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
                <DialogTitle>{t("depositDialog.addFunds")}</DialogTitle>
                <DialogDescription>
                  {t("depositDialog.available")}:{" "}
                  <span className="font-medium text-foreground">{formatCurrency(advertiserWallet.availableMinor)}</span>
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-4">
                <Field data-invalid={!!error && amount !== "" ? true : undefined}>
                  <FieldLabel htmlFor="dep-amount">{t("depositDialog.depositAmount")}</FieldLabel>
                  <InputGroup>
                    <InputGroupAddon>$</InputGroupAddon>
                    <InputGroupInput
                      id="dep-amount"
                      inputMode="decimal"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      aria-invalid={!!error && amount !== "" ? true : undefined}
                    />
                  </InputGroup>
                </Field>

                <div className="flex items-center gap-2">
                  {presets.map((p) => (
                    <Button
                      key={p}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setAmount(String(p))}
                    >
                      {formatCurrency(p * 100)}
                    </Button>
                  ))}
                </div>

                <Separator />

                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium">{t("depositDialog.paymentMethod")}</span>
                  {paymentMethods.length === 0 ? (
                    <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-border p-4">
                      <p className="text-sm text-muted-foreground">{t("depositDialog.noMethodAdded")}</p>
                      <Button variant="secondary" size="sm" onClick={() => setAddMethodOpen(true)}>
                        <Plus data-icon="inline-start" />
                        {t("depositDialog.addPaymentMethod")}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {paymentMethods.map((m) => {
                        const Icon = methodIcon[m.type]
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
                              <Icon className="size-4" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{m.label}</span>
                              <span className="text-xs text-muted-foreground">
                                {m.last4 === "WIRE" ? t("depositDialog.bankWire") : `•••• ${m.last4}`}
                              </span>
                            </div>
                            {selected && <CheckCircle2 className="ml-auto size-4 text-primary" />}
                          </button>
                        )
                      })}
                      <Button variant="ghost" size="sm" className="self-start" onClick={() => setAddMethodOpen(true)}>
                        <Plus data-icon="inline-start" />
                        {t("depositDialog.addAnotherMethod")}
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
                  {t("depositDialog.reviewDeposit")}
                  <ArrowRight data-icon="inline-end" />
                </Button>
              </DialogFooter>
            </>
          )}

          {step === "review" && method && (
            <>
              <DialogHeader>
                <DialogTitle>{t("depositDialog.addFunds")}</DialogTitle>
                <DialogDescription>{t("depositDialog.confirmDetails")}</DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
                <Row label={t("depositDialog.depositAmount")} value={formatCurrency(numericMinor)} />
                <Row label={t("depositDialog.processingFee")} value={formatCurrency(0)} />
                <Separator />
                <Row label={t("depositDialog.totalCharged")} value={formatCurrency(numericMinor)} strong />
                <Row
                  label={t("depositDialog.paymentMethod")}
                  value={`${method.label}${method.last4 === "WIRE" ? "" : ` •••• ${method.last4}`}`}
                />
                <Row
                  label={t("depositDialog.newAvailableBalance")}
                  value={formatCurrency(advertiserWallet.availableMinor + numericMinor)}
                />
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setStep("form")} disabled={processing}>
                  {t("depositDialog.back")}
                </Button>
                <Button onClick={confirm} disabled={processing}>
                  {processing ? (
                    <>
                      <Loader2 data-icon="inline-start" className="animate-spin" />
                      {t("depositDialog.processing")}
                    </>
                  ) : (
                    t("depositDialog.confirmDeposit")
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
                <DialogTitle>{t("depositDialog.fundsAdded")}</DialogTitle>
                <DialogDescription>{t("depositDialog.balanceReady")}</DialogDescription>
              </DialogHeader>

              <div className="flex flex-col items-center gap-1 py-2">
                <span className="text-3xl font-semibold tabular-nums text-primary">+{formatCurrency(numericMinor)}</span>
                <span className="text-sm text-muted-foreground">
                  {t("depositDialog.newBalance")}:{" "}
                  <span className="text-foreground">{formatCurrency(advertiserWallet.availableMinor)}</span>
                </span>
              </div>

              <DialogFooter>
                <Button onClick={close}>{t("depositDialog.done")}</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AddPaymentMethodDialog
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
