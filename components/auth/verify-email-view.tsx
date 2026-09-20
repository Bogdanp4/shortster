"use client"

import { toast } from "sonner"
import { AuthShell } from "./auth-shell"
import { useAuth } from "./auth-provider"
import { Button } from "@/components/ui/button"
import { MailCheck, CheckCircle2 } from "lucide-react"

export function VerifyEmailView() {
  const { pendingEmail, resendVerification, verifyEmailMock, signOut } = useAuth()

  return (
    <AuthShell title="Check your email" description="Confirm your address to activate your account">
      <div className="flex flex-col items-center gap-5 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-primary/12 text-primary">
          <MailCheck className="size-6" />
        </span>
        <p className="text-sm text-muted-foreground">
          We sent a verification link to{" "}
          <span className="font-medium text-foreground">{pendingEmail ?? "your email"}</span>. Click the link to
          continue.
        </p>

        {/* Prototype shortcut — a real deployment verifies via the emailed link, not a button. */}
        <Button className="w-full" onClick={verifyEmailMock}>
          <CheckCircle2 className="size-4" />
          I&apos;ve verified my email (demo)
        </Button>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            resendVerification()
            toast.success("Verification email resent")
          }}
        >
          Resend Verification Email
        </Button>

        <button type="button" onClick={signOut} className="text-sm text-muted-foreground hover:text-foreground">
          Back to sign in
        </button>
      </div>
    </AuthShell>
  )
}
