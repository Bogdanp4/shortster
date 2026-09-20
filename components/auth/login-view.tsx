"use client"

import { useState } from "react"
import { toast } from "sonner"
import { AuthShell } from "./auth-shell"
import { useAuth } from "./auth-provider"
import { useT } from "@/components/i18n/locale-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, AlertTriangle, Ban, MailWarning } from "lucide-react"
import { demoUsers } from "@/lib/auth-mock-data"

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function LoginView() {
  const { signIn, signInDemo, navigateAuth, demoMode, resendVerification } = useAuth()
  const t = useT()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<
    "invalid_credentials" | "email_not_verified" | "account_suspended" | "account_banned" | "form" | null
  >(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValidEmail(email) || !password) {
      setError("form")
      return
    }
    setLoading(true)
    setError(null)
    const result = await signIn(email, password, remember)
    setLoading(false)
    if (result) {
      setError(result)
      return
    }
    toast.success(t("auth.welcomeBack"))
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.nativeEvent.isComposing && e.nativeEvent.keyCode !== 229) {
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  return (
    <AuthShell title={t("auth.loginTitle")} description={t("auth.loginSubtitle")}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <FieldGroup>
          {error === "form" && (
            <Alert variant="destructive">
              <AlertTriangle className="size-4" />
              <AlertDescription>{t("auth.errFormInvalid")}</AlertDescription>
            </Alert>
          )}
          {error === "invalid_credentials" && (
            <Alert variant="destructive">
              <AlertTriangle className="size-4" />
              <AlertDescription>{t("auth.errInvalidCredentials")}</AlertDescription>
            </Alert>
          )}
          {error === "account_suspended" && (
            <Alert variant="destructive">
              <AlertTriangle className="size-4" />
              <AlertTitle>{t("auth.errSuspendedTitle")}</AlertTitle>
              <AlertDescription>{t("auth.errSuspendedBody")}</AlertDescription>
            </Alert>
          )}
          {error === "account_banned" && (
            <Alert variant="destructive">
              <Ban className="size-4" />
              <AlertTitle>{t("auth.errBannedTitle")}</AlertTitle>
              <AlertDescription>{t("auth.errBannedBody")}</AlertDescription>
            </Alert>
          )}
          {error === "email_not_verified" && (
            <Alert>
              <MailWarning className="size-4" />
              <AlertTitle>{t("auth.errUnverifiedTitle")}</AlertTitle>
              <AlertDescription className="flex flex-col gap-2">
                <span>{t("auth.errUnverifiedBody")}</span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="w-fit"
                  onClick={() => {
                    resendVerification()
                    toast.success(t("auth.verificationResent"))
                  }}
                >
                  {t("auth.resendVerification")}
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <Field>
            <FieldLabel htmlFor="login-email">{t("common.email")}</FieldLabel>
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder={t("auth.emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </Field>

          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="login-password">{t("common.password")}</FieldLabel>
              <button
                type="button"
                onClick={() => navigateAuth("forgot-password")}
                className="text-xs font-medium text-primary hover:underline"
              >
                {t("auth.forgotPassword")}
              </button>
            </div>
            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </Field>

          <Field orientation="horizontal">
            <Checkbox id="remember" checked={remember} onCheckedChange={(v) => setRemember(v === true)} />
            <FieldLabel htmlFor="remember" className="font-normal">
              {t("auth.rememberMe")}
            </FieldLabel>
          </Field>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? t("auth.signingIn") : t("common.signIn")}
          </Button>
        </FieldGroup>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        {t("auth.noAccount")}{" "}
        <button type="button" onClick={() => navigateAuth("signup")} className="font-medium text-primary hover:underline">
          {t("common.signUp")}
        </button>
      </p>

      {demoMode && (
        <div className="mt-6 border-t border-border/60 pt-5">
          <p className="mb-2.5 text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {t("auth.demoOnly")}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {demoUsers
              .filter((u) => u.roles.length === 1)
              .map((u) => (
                <Button
                  key={u.id}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    signInDemo(u.id)
                    toast.success(t("auth.signedInAs", { name: u.name }))
                  }}
                >
                  {u.name}
                </Button>
              ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="col-span-2"
              onClick={() => {
                signInDemo("demo-multi")
                toast.success(t("auth.signedInAs", { name: "Jordan Blake" }))
              }}
            >
              Jordan Blake — Creator + Advertiser
            </Button>
          </div>
        </div>
      )}
    </AuthShell>
  )
}
