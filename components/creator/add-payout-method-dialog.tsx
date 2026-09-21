"use client"

import { useState } from "react"
import { toast } from "sonner"

import { useApp } from "@/components/app/app-provider"
import { useT } from "@/components/i18n/locale-provider"
import { SUPPORTED_CRYPTO_ASSETS, SUPPORTED_CRYPTO_NETWORKS } from "@/lib/config"
import { payoutNetworkLabel } from "@/lib/format"
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

const assetLabel: Record<CryptoAsset, string> = {
  USDT: "USDT (Tether)",
  USDC: "USDC (USD Coin)",
}

const assets: { value: CryptoAsset; label: string }[] = SUPPORTED_CRYPTO_ASSETS.map((value) => ({
  value,
  label: assetLabel[value],
}))

const networks: { value: CryptoNetwork; label: string }[] = SUPPORTED_CRYPTO_NETWORKS.map((value) => ({
  value,
  label: payoutNetworkLabel[value] ?? value,
}))

// Loose per-network address validation — enough to catch obvious mistakes in the
// prototype without pretending to be a real on-chain checksum.
function validateAddress(
  network: CryptoNetwork,
  address: string,
  t: (key: string) => string,
): string | null {
  const a = address.trim()
  if (!a) return t("payoutMethodDialog.enterAddress")
  switch (network) {
    case "ethereum":
    case "bsc":
    case "polygon":
      return /^0x[a-fA-F0-9]{40}$/.test(a) ? null : t("payoutMethodDialog.invalidEvmAddress")
    case "tron":
      return /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(a) ? null : t("payoutMethodDialog.invalidTronAddress")
    case "solana":
      return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(a) ? null : t("payoutMethodDialog.invalidSolanaAddress")
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
  const t = useT()
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

  const addressError = validateAddress(network, address, t)
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
    toast.success(t("payoutMethodDialog.savedToast"))
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
          <DialogTitle>{t("payoutMethodDialog.title")}</DialogTitle>
          <DialogDescription>{t("payoutMethodDialog.description")}</DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="asset">{t("payoutMethodDialog.asset")}</FieldLabel>
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
              <FieldLabel htmlFor="network">{t("payoutMethodDialog.network")}</FieldLabel>
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
            <FieldLabel htmlFor="address">{t("payoutMethodDialog.walletAddress")}</FieldLabel>
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
                t("payoutMethodDialog.receivingNote", { asset, network: payoutNetworkLabel[network] ?? network })
              )}
            </FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="label">{t("payoutMethodDialog.label")}</FieldLabel>
            <Input
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={t("payoutMethodDialog.labelPlaceholder")}
            />
          </Field>
          <Field orientation="horizontal">
            <Checkbox id="confirm-payout" checked={confirm} onCheckedChange={(v) => setConfirm(v === true)} />
            <FieldLabel htmlFor="confirm-payout" className="font-normal">
              {t("payoutMethodDialog.confirmCheckbox", { asset, network: payoutNetworkLabel[network] ?? network })}
            </FieldLabel>
          </Field>
        </FieldGroup>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={save} disabled={!canSave}>
            {t("payoutMethodDialog.savePayoutWallet")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
