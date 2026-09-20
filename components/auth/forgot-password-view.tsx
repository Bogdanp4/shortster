"use client"

import { useState } from "react"
import { AuthShell } from "./auth-shell"
import { useAuth } from "./auth-provider"
import { useT } from "@/components/i18n/locale-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"
import { MailCheck } from "lucide-react"

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function ForgotPasswordView() {
  const { screen, requestPasswordReset, pendingEmail, navigateAuth } = useAuth()
  const t = useT()
  const [email, setEmail] = useState("")
  const [touched, setTouched] = useState(false)

  if (screen === "forgot-password-sent") {
    return (
      <AuthShell title={t("auth.resetSentTitle")} description={t("auth.resetSentSubtitle")}>
        <div className="flex flex-col items-center gap-5 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary/12 text-primary">
            <MailCheck className="size-6" />
          </span>
          <p className="text-sm text-muted-foreground">
            {t("auth.resetSentBodyPre")} <span className="font-medium text-foreground">{pendingEmail}</span>
            {t("auth.resetSentBodyPost")}
          </p>

          {/* Prototype shortcut — a real deployment continues via the emailed link, not a button. */}
          <Button className="w-full" onClick={() => navigateAuth("reset-password")}>
            {t("auth.continueResetDemo")}
          </Button>

          <button
            type="button"
            onClick={() => navigateAuth("login")}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            {t("auth.backToSignIn")}
          </button>
        </div>
      </AuthShell>
    )
  }

  const emailError = touched && !isValidEmail(email) ? t("auth.errEmailInvalid") : null

  return (
    <AuthShell title={t("auth.forgotTitle")} description={t("auth.forgotSubtitle")}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          setTouched(true)
          if (!isValidEmail(email)) return
          requestPasswordReset(email)
        }}
        className="flex flex-col gap-5"
      >
        <Field>
          <FieldLabel htmlFor="forgot-email">{t("common.email")}</FieldLabel>
          <Input
            id="forgot-email"
            type="email"
            autoComplete="email"
            placeholder={t("auth.emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!emailError}
          />
          {emailError && <p className="text-sm text-destructive">{emailError}</p>}
        </Field>
        <Button type="submit" className="w-full">
          {t("auth.sendResetLink")}
        </Button>
      </form>

      <button
        type="button"
        onClick={() => navigateAuth("login")}
        className="mt-5 block w-full text-center text-sm text-muted-foreground hover:text-foreground"
      >
        {t("auth.backToSignIn")}
      </button>
    </AuthShell>
  )
}
