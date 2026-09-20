"use client"

import { useState } from "react"
import { toast } from "sonner"

import { useApp } from "@/components/app/app-provider"
import type { PayoutMethod, CryptoAsset, CryptoNetwork } from "@/lib/types"
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

const assets: { value: CryptoAsset; label: string }[] = [
  { value: "USDT", label: "USDT (Tether)" },
  { value: "USDC", label: "USDC (USD Coin)" },
]

const networks: { value: CryptoNetwork; label: string; note: string }[] = [
  { value: "ethereum", label: "Ethereum (ERC-20)", note: "Higher network fees, widely supported" },
  { value: "tron", label: "Tron (TRC-20)", note: "Low fees, popular for stablecoins" },
  { value: "bsc", label: "BNB Smart Chain (BEP-20)", note: "Low fees" },
  { value: "polygon", label: "Polygon", note: "Very low fees" },
  { value: "solana", label: "Solana", note: "Fast, very low fees" },
]

const networkLabel: Record<CryptoNetwork, string> = {
  ethereum: "Ethereum (ERC-20)",
  tron: "Tron (TRC-20)",
  bsc: "BNB Smart Chain (BEP-20)",
  polygon: "Polygon",
  solana: "Solana",
}

// Loose per-network address validation — enough to catch obvious mistakes in the
// prototype without pretending to be a real on-chain checksum.
function validateAddress(network: CryptoNetwork, address: string): string | null {
  const a = address.trim()
  if (!a) return "Enter your wallet address."
  switch (network) {
    case "ethereum":
    case "bsc":
    case "polygon":
      return /^0x[a-fA-F0-9]{40}$/.test(a) ? null : "Expected a 0x address with 40 hex characters."
    case "tron":
      return /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(a) ? null : "Expected a Tron address starting with T."
    case "solana":
      return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(a) ? null : "Expected a base58 Solana address."
    default:
      return null
  }
}

function shorten(address: string) {
  const a = address.trim()
  return a.length > 12 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a
}

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
  const [asset, setAsset] = useState<CryptoAsset>("USDT")
  const [network, setNetwork] = useState<CryptoNetwork>("tron")
  const [address, setAddress] = useState("")
  const [label, setLabel] = useState("")
  const [confirm, setConfirm] = useState(false)
  const [touched, setTouched] = useState(false)

  function reset() {
    setAsset("USDT")
    setNetwork("tron")
    setAddress("")
    setLabel("")
    setConfirm(false)
    setTouched(false)
  }

  const addressError = validateAddress(network, address)
  const canSave = !addressError && confirm

  function save() {
    if (addressError) {
      setTouched(true)
      return
    }
    const method: PayoutMethod = {
      id: `po-${Date.now()}`,
      asset,
      network,
      walletAddress: address.trim(),
      label: label.trim() || `${asset} · ${shorten(address)}`,
      verified: true,
    }
    addPayoutMethod(method)
    toast.success("Crypto payout wallet saved")
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
          <DialogTitle>Add crypto payout wallet</DialogTitle>
          <DialogDescription>
            Withdrawals are paid in stablecoins. Double-check the network — funds sent to the wrong network cannot be
            recovered.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="asset">Asset</FieldLabel>
              <Select value={asset} onValueChange={(v) => v && setAsset(v as CryptoAsset)}>
                <SelectTrigger id="asset">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {assets.map((a) => (
                      <SelectItem key={a.value} value={a.value}>
                        {a.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="network">Network</FieldLabel>
              <Select value={network} onValueChange={(v) => v && setNetwork(v as CryptoNetwork)}>
                <SelectTrigger id="network">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {networks.map((n) => (
                      <SelectItem key={n.value} value={n.value}>
                        {n.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="address">Wallet address</FieldLabel>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onBlur={() => setTouched(true)}
              placeholder={network === "tron" ? "T…" : network === "solana" ? "base58 address" : "0x…"}
              aria-invalid={touched && !!addressError}
            />
            <FieldDescription>
              {touched && addressError ? (
                <span className="text-destructive">{addressError}</span>
              ) : (
                `Receiving ${asset} on ${networkLabel[network]}. Prototype only — no real transfer is made.`
              )}
            </FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="label">Label (optional)</FieldLabel>
            <Input
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Main wallet"
            />
          </Field>
          <Field orientation="horizontal">
            <Checkbox id="confirm-payout" checked={confirm} onCheckedChange={(v) => setConfirm(v === true)} />
            <FieldLabel htmlFor="confirm-payout" className="font-normal">
              I confirm this wallet supports {asset} on {networkLabel[network]} and the address is correct.
            </FieldLabel>
          </Field>
        </FieldGroup>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save} disabled={!canSave}>
            Save payout wallet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
