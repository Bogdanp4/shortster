"use client"

import { useState } from "react"
import { AuthShell } from "./auth-shell"
import { useAuth } from "./auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldGroup, FieldDescription } from "@/components/ui/field"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, AlertTriangle, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const passwordRules = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One number", test: (p: string) => /[0-9]/.test(p) },
]

export function SignupView() {
  const { signUp, navigateAuth } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState(false)
  const [serverError, setServerError] = useState<"email_taken" | null>(null)

  const emailError = touched && !isValidEmail(email) ? "Enter a valid email address." : null
  const passwordFailures = passwordRules.filter((r) => !r.test(password))
  const passwordError = touched && passwordFailures.length > 0 ? "Password does not meet requirements." : null
  const confirmError = touched && confirmPassword !== password ? "Passwords do not match." : null
  const canSubmit = isValidEmail(email) && passwordFailures.length === 0 && confirmPassword === password

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
    <AuthShell title="Create your account" description="Start earning or advertising on Shortster">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <FieldGroup>
          {serverError === "email_taken" && (
            <Alert variant="destructive">
              <AlertTriangle className="size-4" />
              <AlertDescription>
                An account with this email already exists.{" "}
                <button type="button" onClick={() => navigateAuth("login")} className="underline underline-offset-2">
                  Sign in instead
                </button>
                .
              </AlertDescription>
            </Alert>
          )}

          <Field>
            <FieldLabel htmlFor="signup-email">Email</FieldLabel>
            <Input
              id="signup-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!emailError}
            />
            {emailError && <FieldDescription className="text-destructive">{emailError}</FieldDescription>}
          </Field>

          <Field>
            <FieldLabel htmlFor="signup-password">Password</FieldLabel>
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
                aria-label={showPassword ? "Hide password" : "Show password"}
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
            <FieldLabel htmlFor="signup-confirm">Confirm password</FieldLabel>
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
            {loading ? "Creating account…" : "Create Account"}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            By creating an account, you agree to Shortster&apos;s Terms of Service and Privacy Policy.
          </p>
        </FieldGroup>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <button type="button" onClick={() => navigateAuth("login")} className="font-medium text-primary hover:underline">
          Sign in
        </button>
      </p>
    </AuthShell>
  )
}
