"use client"

import { useState } from "react"
import { toast } from "sonner"

import { useApp } from "@/components/app/app-provider"
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
      label: type === "card" ? "Visa" : type === "wire" ? "Wire transfer" : "Crypto",
      last4: type === "wire" ? "WIRE" : last4,
      detail: type === "card" ? "Expires 12/29" : undefined,
    }
    addPaymentMethod(method)
    toast.success("Payment method added")
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
          <DialogTitle>Add payment method</DialogTitle>
          <DialogDescription>Add a funding source for campaign deposits. Prototype only.</DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel>Method type</FieldLabel>
            <ToggleGroup
              value={[type]}
              onValueChange={(v) => {
                const next = v[v.length - 1] as PaymentMethodType | undefined
                if (next) setType(next)
              }}
              className="justify-start"
            >
              <ToggleGroupItem value="card">Card</ToggleGroupItem>
              <ToggleGroupItem value="wire">Wire</ToggleGroupItem>
              <ToggleGroupItem value="crypto">Crypto</ToggleGroupItem>
            </ToggleGroup>
          </Field>
          {type !== "wire" && (
            <>
              <Field>
                <FieldLabel htmlFor="pm-name">Name on {type === "card" ? "card" : "account"}</FieldLabel>
                <Input id="pm-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Media Inc." />
              </Field>
              <Field>
                <FieldLabel htmlFor="pm-number">{type === "card" ? "Card number" : "Wallet address"}</FieldLabel>
                <Input
                  id="pm-number"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  placeholder={type === "card" ? "4242 4242 4242 4242" : "0x…"}
                />
              </Field>
            </>
          )}
          {type === "wire" && (
            <FieldDescription>
              Wire transfers are confirmed manually. We will generate reference details after you continue.
            </FieldDescription>
          )}
        </FieldGroup>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save} disabled={!canSave}>
            Add method
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
