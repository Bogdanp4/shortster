"use client"

import { useState } from "react"
import { toast } from "sonner"

import { useApp } from "@/components/app/app-provider"
import type { PayoutMethod, PayoutMethodType } from "@/lib/types"
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
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

const typeLabels: Record<PayoutMethodType, string> = {
  bank: "Bank transfer",
  paypal: "PayPal",
  crypto: "Crypto wallet",
}

const countries = ["United States", "United Kingdom", "Canada", "Germany", "Australia", "Singapore"]

export function AddPayoutMethodDialog({
  open,
  onOpenChange,
  onAdded,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdded?: (method: PayoutMethod) => void
}) {
  const { addPayoutMethod } = useApp()
  const [type, setType] = useState<PayoutMethodType>("bank")
  const [holder, setHolder] = useState("")
  const [country, setCountry] = useState("United States")
  const [details, setDetails] = useState("")
  const [confirm, setConfirm] = useState(false)

  function reset() {
    setType("bank")
    setHolder("")
    setCountry("United States")
    setDetails("")
    setConfirm(false)
  }

  const detailsValid = details.replace(/\s/g, "").length >= 4
  const canSave = holder.trim().length > 1 && detailsValid && confirm

  function save() {
    const last4 = details.replace(/\D/g, "").slice(-4) || "4821"
    const method: PayoutMethod = {
      id: `po-${Date.now()}`,
      type,
      label: type === "bank" ? "Bank Account" : type === "paypal" ? "PayPal" : "Crypto Wallet",
      last4,
      detail: `${country} · USD`,
      verified: true,
    }
    addPayoutMethod(method)
    toast.success("Payout method saved")
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
          <DialogTitle>Add payout method</DialogTitle>
          <DialogDescription>Where should we send your earnings? Details are stored securely.</DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel>Payout method</FieldLabel>
            <ToggleGroup
              value={[type]}
              onValueChange={(v) => {
                const next = v[v.length - 1] as PayoutMethodType | undefined
                if (next) setType(next)
              }}
              className="justify-start"
            >
              <ToggleGroupItem value="bank">Bank transfer</ToggleGroupItem>
              <ToggleGroupItem value="paypal">PayPal</ToggleGroupItem>
              <ToggleGroupItem value="crypto">Crypto</ToggleGroupItem>
            </ToggleGroup>
          </Field>
          <Field>
            <FieldLabel htmlFor="holder">Account holder name</FieldLabel>
            <Input id="holder" value={holder} onChange={(e) => setHolder(e.target.value)} placeholder="Alex Rivera" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="country">Country</FieldLabel>
              <Select value={country} onValueChange={(v) => v && setCountry(v)}>
                <SelectTrigger id="country">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {countries.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="currency">Currency</FieldLabel>
              <Input id="currency" value="USD" readOnly disabled />
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="details">
              {type === "bank" ? "Account number / IBAN" : type === "paypal" ? "PayPal email" : "Wallet address"}
            </FieldLabel>
            <Input
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={type === "bank" ? "•••• •••• •••• 4821" : type === "paypal" ? "you@email.com" : "0x…"}
            />
            <FieldDescription>{typeLabels[type]} — prototype only, no real transfer is made.</FieldDescription>
          </Field>
          <Field orientation="horizontal">
            <Checkbox id="confirm-payout" checked={confirm} onCheckedChange={(v) => setConfirm(v === true)} />
            <FieldLabel htmlFor="confirm-payout" className="font-normal">
              I confirm that the payout details belong to me.
            </FieldLabel>
          </Field>
        </FieldGroup>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save} disabled={!canSave}>
            Save payout method
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
