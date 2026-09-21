"use client"

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react"
import type { AuthScreen, AuthUser, AdvertiserOnboardingProfile, PublicRole, Role } from "@/lib/types"
import { mockHash, seedAccountsDb } from "@/lib/auth-mock-data"
import { getDefaultDemoMode } from "@/lib/dev-config"

export type SignInError =
  | "invalid_credentials"
  | "email_not_verified"
  | "account_suspended"
  | "account_banned"
  | null

export type SignUpError = "email_taken" | null

interface AuthState {
  currentUser: AuthUser | null
  screen: AuthScreen
  demoMode: boolean
  setDemoMode: (v: boolean) => void
  navigateAuth: (screen: AuthScreen) => void
  pendingEmail: string | null

  signIn: (email: string, password: string, remember: boolean) => Promise<SignInError>
  signUp: (email: string, password: string) => Promise<SignUpError>
  signInDemo: (userId: string) => void
  signOut: () => void

  resendVerification: () => void
  verifyEmailMock: () => void
  finishVerifiedIntro: () => void

  requestPasswordReset: (email: string) => void
  resetPassword: (password: string) => void

  selectRole: (role: PublicRole) => void
  completeAdvertiserOnboarding: (profile: AdvertiserOnboardingProfile) => void

  switchWorkspace: (role: Role) => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const dbRef = useRef<AuthUser[]>([...seedAccountsDb])
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [screen, setScreen] = useState<AuthScreen>("landing")
  const [demoMode, setDemoMode] = useState(getDefaultDemoMode())
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)

  const navigateAuth = useCallback((next: AuthScreen) => {
    setScreen(next)
    if (typeof window !== "undefined") window.scrollTo({ top: 0 })
  }, [])

  const persist = useCallback((user: AuthUser) => {
    dbRef.current = dbRef.current.map((u) => (u.id === user.id ? user : u))
  }, [])

  const signIn = useCallback(
    async (email: string, password: string, _remember: boolean): Promise<SignInError> => {
      await new Promise((r) => setTimeout(r, 500))
      const normalized = email.trim().toLowerCase()
      const found = dbRef.current.find((u) => u.email.toLowerCase() === normalized)
      if (!found || found.passwordHash !== mockHash(password)) return "invalid_credentials"
      if (found.status === "banned") return "account_banned"
      if (found.status === "suspended") return "account_suspended"
      if (found.status === "email_verification_required") return "email_not_verified"
      setCurrentUser(found)
      return null
    },
    [],
  )

  const signUp = useCallback(async (email: string, password: string): Promise<SignUpError> => {
    await new Promise((r) => setTimeout(r, 500))
    const normalized = email.trim().toLowerCase()
    if (dbRef.current.some((u) => u.email.toLowerCase() === normalized)) return "email_taken"
    const newUser: AuthUser = {
      id: `user-${Date.now()}`,
      email: normalized,
      passwordHash: mockHash(password),
      name: normalized.split("@")[0],
      status: "email_verification_required",
      roles: [],
      activeWorkspace: "creator",
      emailVerified: false,
      onboardingCompleted: false,
      createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      updatedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    }
    dbRef.current = [...dbRef.current, newUser]
    setPendingEmail(normalized)
    setCurrentUser(newUser)
    navigateAuth("verify-email")
    return null
  }, [navigateAuth])

  const signInDemo = useCallback((userId: string) => {
    const found = dbRef.current.find((u) => u.id === userId)
    if (found) setCurrentUser(found)
  }, [])

  const signOut = useCallback(() => {
    if (currentUser) persist(currentUser)
    setCurrentUser(null)
    setPendingEmail(null)
    navigateAuth("landing")
  }, [currentUser, persist, navigateAuth])

  const resendVerification = useCallback(() => {
    // Mocked — no-op besides UI feedback handled by the caller.
  }, [])

  const verifyEmailMock = useCallback(() => {
    if (!currentUser) return
    const next: AuthUser = { ...currentUser, emailVerified: true, status: "registered" }
    setCurrentUser(next)
    persist(next)
    navigateAuth("verify-email-success")
  }, [currentUser, persist, navigateAuth])

  const finishVerifiedIntro = useCallback(() => {
    // Falls through to role-selection / onboarding via the root gate — no auth screen needed.
    setScreen("landing")
  }, [])

  const requestPasswordReset = useCallback((email: string) => {
    setPendingEmail(email.trim().toLowerCase())
    navigateAuth("forgot-password-sent")
  }, [navigateAuth])

  const resetPassword = useCallback((password: string) => {
    if (pendingEmail) {
      dbRef.current = dbRef.current.map((u) =>
        u.email.toLowerCase() === pendingEmail ? { ...u, passwordHash: mockHash(password) } : u,
      )
    }
    navigateAuth("reset-password-success")
  }, [pendingEmail, navigateAuth])

  const selectRole = useCallback((role: PublicRole) => {
    if (!currentUser) return
    const roles = currentUser.roles.includes(role) ? currentUser.roles : [...currentUser.roles, role]
    // Creators go straight into the product — no multi-step onboarding.
    // Advertisers get a single lightweight brand-setup screen (skippable).
    const next: AuthUser =
      role === "creator"
        ? {
            ...currentUser,
            roles,
            activeWorkspace: role,
            status: "active",
            onboardingCompleted: true,
          }
        : {
            ...currentUser,
            roles,
            activeWorkspace: role,
            status: "onboarding",
          }
    setCurrentUser(next)
    persist(next)
  }, [currentUser, persist])

  const completeAdvertiserOnboarding = useCallback((profile: AdvertiserOnboardingProfile) => {
    if (!currentUser) return
    const next: AuthUser = {
      ...currentUser,
      advertiserProfile: profile,
      onboardingCompleted: true,
      status: "active",
    }
    setCurrentUser(next)
    persist(next)
  }, [currentUser, persist])

  const switchWorkspace = useCallback((role: Role) => {
    if (!currentUser) return
    const next: AuthUser = { ...currentUser, activeWorkspace: role }
    setCurrentUser(next)
    persist(next)
  }, [currentUser, persist])

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        screen,
        demoMode,
        setDemoMode,
        navigateAuth,
        pendingEmail,
        signIn,
        signUp,
        signInDemo,
        signOut,
        resendVerification,
        verifyEmailMock,
        finishVerifiedIntro,
        requestPasswordReset,
        resetPassword,
        selectRole,
        completeAdvertiserOnboarding,
        switchWorkspace,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
