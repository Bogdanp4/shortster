"use client"

import { useState } from "react"
import { AuthShell } from "./auth-shell"
import { useAuth } from "./auth-provider"
import { useT } from "@/components/i18n/locale-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldGroup, FieldDescription } from "@/components/ui/field"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, AlertTriangle, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function SignupView() {
  const { signUp, navigateAuth } = useAuth()
  const t = useT()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState(false)
  const [serverError, setServerError] = useState<"email_taken" | null>(null)

  const passwordRules = [
    { label: t("auth.pwRuleLength"), test: (p: string) => p.length >= 8 },
    { label: t("auth.pwRuleUpper"), test: (p: string) => /[A-Z]/.test(p) },
    { label: t("auth.pwRuleNumber"), test: (p: string) => /[0-9]/.test(p) },
  ]

  const emailError = touched && !isValidEmail(email) ? t("auth.errEmailInvalid") : null
  const passwordFailures = passwordRules.filter((r) => !r.test(password))
  const passwordError = touched && passwordFailures.length > 0 ? t("auth.errPwRequirements") : null
  const confirmError = touched && confirmPassword !== password ? t("auth.errPwMismatch") : null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched(true)
    setServerError(null)
    if (!isValidEmail(email) || passwordFailures.length > 0 || confirmPassword !== password) return
    setLoading(true)
    const result = await signUp(email, password)
    setLoading(false)
    if (result === "email_taken") setServerError("email_taken")
  }

  return (
    <AuthShell title={t("auth.signupTitle")} description={t("auth.signupSubtitle")}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <FieldGroup>
          {serverError === "email_taken" && (
            <Alert variant="destructive">
              <AlertTriangle className="size-4" />
              <AlertDescription>
                {t("auth.errEmailTaken")}{" "}
                <button type="button" onClick={() => navigateAuth("login")} className="underline underline-offset-2">
                  {t("auth.signInInstead")}
                </button>
                .
              </AlertDescription>
            </Alert>
          )}

          <Field>
            <FieldLabel htmlFor="signup-email">{t("common.email")}</FieldLabel>
            <Input
              id="signup-email"
              type="email"
              autoComplete="email"
              placeholder={t("auth.emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!emailError}
            />
            {emailError && <FieldDescription className="text-destructive">{emailError}</FieldDescription>}
          </Field>

          <Field>
            <FieldLabel htmlFor="signup-password">{t("common.password")}</FieldLabel>
            <div className="relative">
              <Input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!passwordError}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? t("common.hidePassword") : t("common.showPassword")}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <ul className="mt-1 flex flex-col gap-1">
              {passwordRules.map((rule) => {
                const passed = rule.test(password)
                return (
                  <li
                    key={rule.label}
                    className={cn(
                      "flex items-center gap-1.5 text-xs",
                      passed ? "text-emerald-500" : "text-muted-foreground",
                    )}
                  >
                    {passed ? <Check className="size-3" /> : <X className="size-3" />}
                    {rule.label}
                  </li>
                )
              })}
            </ul>
          </Field>

          <Field>
            <FieldLabel htmlFor="signup-confirm">{t("auth.confirmPassword")}</FieldLabel>
            <Input
              id="signup-confirm"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              aria-invalid={!!confirmError}
            />
            {confirmError && <FieldDescription className="text-destructive">{confirmError}</FieldDescription>}
          </Field>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? t("auth.creatingAccount") : t("common.createAccount")}
          </Button>

          <p className="text-center text-xs text-muted-foreground">{t("auth.termsNotice")}</p>
        </FieldGroup>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        {t("auth.haveAccount")}{" "}
        <button type="button" onClick={() => navigateAuth("login")} className="font-medium text-primary hover:underline">
          {t("common.signIn")}
        </button>
      </p>
    </AuthShell>
  )
}
