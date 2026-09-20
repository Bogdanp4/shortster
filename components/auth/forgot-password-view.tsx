"use client"

import { useState } from "react"
import { AuthShell } from "./auth-shell"
import { useAuth } from "./auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"
import { MailCheck } from "lucide-react"

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function ForgotPasswordView() {
  const { screen, requestPasswordReset, pendingEmail, navigateAuth } = useAuth()
  const [email, setEmail] = useState("")
  const [touched, setTouched] = useState(false)

  if (screen === "forgot-password-sent") {
    return (
      <AuthShell title="Check your email" description="A reset link is on its way">
        <div className="flex flex-col items-center gap-5 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary/12 text-primary">
            <MailCheck className="size-6" />
          </span>
          <p className="text-sm text-muted-foreground">
            If an account exists for <span className="font-medium text-foreground">{pendingEmail}</span>, we sent a
            password reset link. It expires in 30 minutes.
          </p>

          {/* Prototype shortcut — a real deployment continues via the emailed link, not a button. */}
          <Button className="w-full" onClick={() => navigateAuth("reset-password")}>
            Continue to reset password (demo)
          </Button>

          <button
            type="button"
            onClick={() => navigateAuth("login")}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Back to sign in
          </button>
        </div>
      </AuthShell>
    )
  }

  const emailError = touched && !isValidEmail(email) ? "Enter a valid email address." : null

  return (
    <AuthShell title="Forgot your password?" description="We'll email you a link to reset it">
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
          <FieldLabel htmlFor="forgot-email">Email</FieldLabel>
          <Input
            id="forgot-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!emailError}
          />
          {emailError && <p className="text-sm text-destructive">{emailError}</p>}
        </Field>
        <Button type="submit" className="w-full">
          Send Reset Link
        </Button>
      </form>

      <button
        type="button"
        onClick={() => navigateAuth("login")}
        className="mt-5 block w-full text-center text-sm text-muted-foreground hover:text-foreground"
      >
        Back to sign in
      </button>
    </AuthShell>
  )
}
