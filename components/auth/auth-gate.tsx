"use client"

import { useAuth } from "./auth-provider"
import { AppProvider } from "@/components/app/app-provider"
import { DashboardShell } from "@/components/app/dashboard-shell"
import { LandingView } from "./landing-view"
import { LoginView } from "./login-view"
import { SignupView } from "./signup-view"
import { VerifyEmailView } from "./verify-email-view"
import { VerifyEmailSuccessView } from "./verify-email-success-view"
import { ForgotPasswordView } from "./forgot-password-view"
import { ResetPasswordView } from "./reset-password-view"
import { RoleSelectionView } from "./role-selection-view"
import { AdvertiserOnboardingView } from "./advertiser-onboarding-view"

export function AuthGate() {
  const { currentUser, screen } = useAuth()

  if (!currentUser) {
    switch (screen) {
      case "login":
        return <LoginView />
      case "signup":
        return <SignupView />
      case "verify-email":
        return <VerifyEmailView />
      case "verify-email-success":
        return <VerifyEmailSuccessView />
      case "forgot-password":
        return <ForgotPasswordView />
      case "forgot-password-sent":
        return <ForgotPasswordView />
      case "reset-password":
        return <ResetPasswordView />
      case "reset-password-success":
        return <ResetPasswordView />
      case "landing":
      default:
        return <LandingView />
    }
  }

  if (currentUser.status === "email_verification_required") {
    return <VerifyEmailView />
  }

  if (currentUser.status === "registered") {
    return <RoleSelectionView />
  }

  if (currentUser.status === "onboarding") {
    // Only advertisers have a (single, skippable) setup step now.
    return <AdvertiserOnboardingView />
  }

  // status === "active" — suspended/banned users never reach here since signIn blocks them earlier.
  return (
    <AppProvider key={currentUser.activeWorkspace} initialRole={currentUser.activeWorkspace}>
      <DashboardShell />
    </AppProvider>
  )
}
