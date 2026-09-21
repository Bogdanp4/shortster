"use client"

import { useState } from "react"
import { toast } from "sonner"

import { useApp } from "@/components/app/app-provider"
import { useT } from "@/components/i18n/locale-provider"
import type { PaymentMethod, PaymentMethodType } from "@/lib/types"
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
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export function AddPaymentMethodDialog({
  open,
  onOpenChange,
  onAdded,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdded?: (method: PaymentMethod) => void
}) {
  const { addPaymentMethod } = useApp()
  const t = useT()
  const [type, setType] = useState<PaymentMethodType>("card")
  const [number, setNumber] = useState("")
  const [name, setName] = useState("")

  function reset() {
    setType("card")
    setNumber("")
    setName("")
  }

  const digits = number.replace(/\D/g, "")
  const canSave = type === "wire" ? true : digits.length >= 4 && name.trim().length > 1

  function save() {
    const last4 = digits.slice(-4) || "0000"
    const method: PaymentMethod = {
      id: `pm-${Date.now()}`,
      type,
      label: type === "card" ? t("pmDialog.visa") : type === "wire" ? t("pmDialog.wireTransfer") : t("pmDialog.crypto"),
      last4: type === "wire" ? "WIRE" : last4,
      detail: type === "card" ? "Expires 12/29" : undefined,
    }
    addPaymentMethod(method)
    toast.success(t("pmDialog.added"))
    onAdded?.(method)
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset()
        onOpenChange(next)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("pmDialog.title")}</DialogTitle>
          <DialogDescription>{t("pmDialog.description")}</DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel>{t("pmDialog.methodType")}</FieldLabel>
            <ToggleGroup
              value={[type]}
              onValueChange={(v) => {
                const next = v[v.length - 1] as PaymentMethodType | undefined
                if (next) setType(next)
              }}
              className="justify-start"
            >
              <ToggleGroupItem value="card">{t("pmDialog.card")}</ToggleGroupItem>
              <ToggleGroupItem value="wire">{t("pmDialog.wire")}</ToggleGroupItem>
              <ToggleGroupItem value="crypto">{t("pmDialog.crypto")}</ToggleGroupItem>
            </ToggleGroup>
          </Field>
          {type !== "wire" && (
            <>
              <Field>
                <FieldLabel htmlFor="pm-name">
                  {type === "card" ? t("pmDialog.nameOnCard") : t("pmDialog.nameOnAccount")}
                </FieldLabel>
                <Input
                  id="pm-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("pmDialog.namePlaceholder")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="pm-number">
                  {type === "card" ? t("pmDialog.cardNumber") : t("pmDialog.walletAddress")}
                </FieldLabel>
                <Input
                  id="pm-number"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  placeholder={type === "card" ? t("pmDialog.cardPlaceholder") : t("pmDialog.walletPlaceholder")}
                />
              </Field>
            </>
          )}
          {type === "wire" && <FieldDescription>{t("pmDialog.wireHint")}</FieldDescription>}
        </FieldGroup>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={save} disabled={!canSave}>
            {t("pmDialog.addMethod")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
