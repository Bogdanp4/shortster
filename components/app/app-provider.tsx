"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { Role, Submission, SocialAccount } from "@/lib/types"
import { defaultView } from "@/lib/nav"
import { creatorSubmissions, creatorSocialAccounts } from "@/lib/mock-data"

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
}

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("creator")
  const [view, setView] = useState<string>(defaultView.creator)
  const [params, setParams] = useState<Record<string, string>>({})
  const [submissions, setSubmissions] = useState<Submission[]>(creatorSubmissions)
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>(creatorSocialAccounts)

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
