"use client"

import { useState } from "react"
import { AuthShell } from "./auth-shell"
import { useAuth } from "./auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"
import { Eye, EyeOff, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Check, X } from "lucide-react"

const passwordRules = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One number", test: (p: string) => /[0-9]/.test(p) },
]

export function ResetPasswordView() {
  const { screen, resetPassword, navigateAuth } = useAuth()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState(false)

  if (screen === "reset-password-success") {
    return (
      <AuthShell title="Password updated" description="You can now sign in with your new password">
        <div className="flex flex-col items-center gap-5 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-emerald-500/12 text-emerald-500">
            <CheckCircle2 className="size-6" />
          </span>
          <Button className="w-full" onClick={() => navigateAuth("login")}>
            Sign In
          </Button>
        </div>
      </AuthShell>
    )
  }

  const passwordFailures = passwordRules.filter((r) => !r.test(password))
  const confirmError = touched && confirmPassword !== password ? "Passwords do not match." : null
  const canSubmit = passwordFailures.length === 0 && confirmPassword === password

  return (
    <AuthShell title="Set a new password" description="Choose a strong password for your account">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          setTouched(true)
          if (!canSubmit) return
          resetPassword(password)
        }}
        className="flex flex-col gap-5"
      >
        <Field>
          <FieldLabel htmlFor="reset-password">New password</FieldLabel>
          <div className="relative">
            <Input
              id="reset-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          <FieldLabel htmlFor="reset-confirm">Confirm new password</FieldLabel>
          <Input
            id="reset-confirm"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            aria-invalid={!!confirmError}
          />
          {confirmError && <p className="text-sm text-destructive">{confirmError}</p>}
        </Field>

        <Button type="submit" disabled={!canSubmit} className="w-full">
          Update Password
        </Button>
      </form>
    </AuthShell>
  )
}
