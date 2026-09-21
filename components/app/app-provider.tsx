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
import { AppErrorException } from "@/lib/errors"
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
import * as submissionService from "@/services/submission-service"
import * as withdrawalService from "@/services/withdrawal-service"
import * as billingService from "@/services/billing-service"
import * as campaignService from "@/services/campaign-service"

interface AppState {
  role: Role
  view: string
  params: Record<string, string>
  setRole: (role: Role) => void
  navigate: (view: string, params?: Record<string, string>) => void

  submissions: Submission[]
  addSubmission: (s: Submission) => Promise<Submission>

  socialAccounts: SocialAccount[]
  addSocialAccount: (s: SocialAccount) => void
  updateSocialAccount: (id: string, patch: Partial<SocialAccount>) => void
  removeSocialAccount: (id: string) => void

  // Creator wallet
  creatorWallet: CreatorWallet
  creatorTransactions: WalletTransaction[]
  payoutMethods: PayoutMethod[]
  addPayoutMethod: (m: PayoutMethod) => void
  withdraw: (amountMinor: number, method: PayoutMethod) => Promise<WalletTransaction>

  // Advertiser wallet
  advertiserWallet: AdvertiserWallet
  advertiserTransactions: WalletTransaction[]
  paymentMethods: PaymentMethod[]
  addPaymentMethod: (m: PaymentMethod) => void
  deposit: (amountMinor: number, method: PaymentMethod) => Promise<WalletTransaction>
  reserveForCampaign: (
    creatorBudgetMinor: number,
    platformFeePercent: number,
    campaignTitle: string,
  ) => Promise<WalletTransaction>
}

const AppContext = createContext<AppState | null>(null)

function today() {
  return new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function ref(prefix: string) {
  return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`
}

export function AppProvider({ children, initialRole = "creator" }: { children: ReactNode; initialRole?: Role }) {
  const [role, setRoleState] = useState<Role>(initialRole)
  const [view, setView] = useState<string>(defaultView[initialRole])
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

  const addSubmission = useCallback(async (s: Submission) => {
    const result = await submissionService.createSubmission(s)
    if (!result.ok) throw new AppErrorException(result.error)
    setSubmissions((prev) => [result.data, ...prev])
    return result.data
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

  const withdraw = useCallback(async (amountMinor: number, method: PayoutMethod) => {
    const result = await withdrawalService.createCryptoWithdrawal({ amountMinor, payoutMethodId: method.id })
    if (!result.ok) throw new AppErrorException(result.error)
    setCreatorTransactions((prev) => [result.data.transaction, ...prev])
    setCreatorWallet(result.data.wallet)
    return result.data.transaction
  }, [])

  const addPaymentMethod = useCallback((m: PaymentMethod) => {
    setPaymentMethods((prev) => [...prev, m])
  }, [])

  const deposit = useCallback(async (amountMinor: number, method: PaymentMethod) => {
    const result = await billingService.createDeposit({ amountMinor, paymentMethodId: method.id })
    if (!result.ok) throw new AppErrorException(result.error)
    setAdvertiserTransactions((prev) => [result.data.transaction, ...prev])
    setAdvertiserWallet(result.data.wallet)
    return result.data.transaction
  }, [])

  const reserveForCampaign = useCallback(
    async (creatorBudgetMinor: number, platformFeePercent: number, campaignTitle: string) => {
      const result = await campaignService.reserveForCampaign({ creatorBudgetMinor, platformFeePercent, campaignTitle })
      if (!result.ok) throw new AppErrorException(result.error)
      setAdvertiserTransactions((prev) => [result.data.transaction, ...prev])
      setAdvertiserWallet(result.data.wallet)
      return result.data.transaction
    },
    [],
  )

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
