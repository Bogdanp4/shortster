"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type {
  Role,
  Submission,
  SocialAccount,
  WalletTransaction,
  PayoutMethod,
  PaymentMethod,
  CreatorWallet,
  AdvertiserWallet,
} from "@/lib/types"
import { defaultView } from "@/lib/nav"
import {
  creatorSubmissions,
  creatorSocialAccounts,
  creatorWallet as initialCreatorWallet,
  creatorTransactions as initialCreatorTransactions,
  creatorPayoutMethods as initialPayoutMethods,
  advertiserWallet as initialAdvertiserWallet,
  advertiserTransactions as initialAdvertiserTransactions,
  advertiserPaymentMethods as initialPaymentMethods,
} from "@/lib/mock-data"

interface AppState {
  role: Role
  view: string
  params: Record<string, string>
  setRole: (role: Role) => void
  navigate: (view: string, params?: Record<string, string>) => void

  submissions: Submission[]
  addSubmission: (s: Submission) => void

  socialAccounts: SocialAccount[]
  addSocialAccount: (s: SocialAccount) => void
  updateSocialAccount: (id: string, patch: Partial<SocialAccount>) => void
  removeSocialAccount: (id: string) => void

  // Creator wallet
  creatorWallet: CreatorWallet
  creatorTransactions: WalletTransaction[]
  payoutMethods: PayoutMethod[]
  addPayoutMethod: (m: PayoutMethod) => void
  withdraw: (amount: number, method: PayoutMethod) => WalletTransaction

  // Advertiser wallet
  advertiserWallet: AdvertiserWallet
  advertiserTransactions: WalletTransaction[]
  paymentMethods: PaymentMethod[]
  addPaymentMethod: (m: PaymentMethod) => void
  deposit: (amount: number, method: PaymentMethod) => WalletTransaction
  reserveForCampaign: (amount: number, campaignTitle: string) => WalletTransaction
}

const AppContext = createContext<AppState | null>(null)

function today() {
  return new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function ref(prefix: string) {
  return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("creator")
  const [view, setView] = useState<string>(defaultView.creator)
  const [params, setParams] = useState<Record<string, string>>({})
  const [submissions, setSubmissions] = useState<Submission[]>(creatorSubmissions)
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>(creatorSocialAccounts)

  const [creatorWallet, setCreatorWallet] = useState<CreatorWallet>(initialCreatorWallet)
  const [creatorTransactions, setCreatorTransactions] = useState<WalletTransaction[]>(initialCreatorTransactions)
  const [payoutMethods, setPayoutMethods] = useState<PayoutMethod[]>(initialPayoutMethods)

  const [advertiserWallet, setAdvertiserWallet] = useState<AdvertiserWallet>(initialAdvertiserWallet)
  const [advertiserTransactions, setAdvertiserTransactions] =
    useState<WalletTransaction[]>(initialAdvertiserTransactions)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(initialPaymentMethods)

  const setRole = useCallback((next: Role) => {
    setRoleState(next)
    setView(defaultView[next])
    setParams({})
  }, [])

  const navigate = useCallback((next: string, nextParams: Record<string, string> = {}) => {
    setView(next)
    setParams(nextParams)
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0 })
    }
  }, [])

  const addSubmission = useCallback((s: Submission) => {
    setSubmissions((prev) => [s, ...prev])
  }, [])

  const addSocialAccount = useCallback((s: SocialAccount) => {
    setSocialAccounts((prev) => [...prev, s])
  }, [])

  const updateSocialAccount = useCallback((id: string, patch: Partial<SocialAccount>) => {
    setSocialAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)))
  }, [])

  const removeSocialAccount = useCallback((id: string) => {
    setSocialAccounts((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const addPayoutMethod = useCallback((m: PayoutMethod) => {
    setPayoutMethods((prev) => [...prev, m])
  }, [])

  const withdraw = useCallback((amount: number, method: PayoutMethod) => {
    const tx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      date: today(),
      type: "Withdrawal",
      description: `${method.asset} payout · ${method.label}`,
      amount: -Math.abs(amount),
      status: "pending",
      reference: ref("WD"),
    }
    setCreatorTransactions((prev) => [tx, ...prev])
    setCreatorWallet((prev) => ({ ...prev, available: Math.round((prev.available - amount) * 100) / 100 }))
    return tx
  }, [])

  const addPaymentMethod = useCallback((m: PaymentMethod) => {
    setPaymentMethods((prev) => [...prev, m])
  }, [])

  const deposit = useCallback((amount: number, method: PaymentMethod) => {
    const tx: WalletTransaction = {
      id: `atx-${Date.now()}`,
      date: today(),
      type: "Deposit",
      description: `${method.label}${method.last4 ? ` •••• ${method.last4}` : ""}`,
      amount: Math.abs(amount),
      status: "completed",
      reference: ref("DEP"),
    }
    setAdvertiserTransactions((prev) => [tx, ...prev])
    setAdvertiserWallet((prev) => ({
      ...prev,
      available: prev.available + amount,
      totalDeposited: prev.totalDeposited + amount,
    }))
    return tx
  }, [])

  const reserveForCampaign = useCallback((amount: number, campaignTitle: string) => {
    const tx: WalletTransaction = {
      id: `atx-${Date.now()}`,
      date: today(),
      type: "Campaign Reserve",
      description: `${campaignTitle} budget`,
      amount: -Math.abs(amount),
      status: "completed",
      reference: ref("RES"),
      campaign: campaignTitle,
    }
    setAdvertiserTransactions((prev) => [tx, ...prev])
    setAdvertiserWallet((prev) => ({
      ...prev,
      available: prev.available - amount,
      reserved: prev.reserved + amount,
    }))
    return tx
  }, [])

  return (
    <AppContext.Provider
      value={{
        role,
        view,
        params,
        setRole,
        navigate,
        submissions,
        addSubmission,
        socialAccounts,
        addSocialAccount,
        updateSocialAccount,
        removeSocialAccount,
        creatorWallet,
        creatorTransactions,
        payoutMethods,
        addPayoutMethod,
        withdraw,
        advertiserWallet,
        advertiserTransactions,
        paymentMethods,
        addPaymentMethod,
        deposit,
        reserveForCampaign,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}
