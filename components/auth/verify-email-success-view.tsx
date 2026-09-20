"use client"

import { AuthShell } from "./auth-shell"
import { useAuth } from "./auth-provider"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

export function VerifyEmailSuccessView() {
  const { finishVerifiedIntro } = useAuth()

  return (
    <AuthShell title="Email verified" description="Your account is confirmed">
      <div className="flex flex-col items-center gap-5 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-emerald-500/12 text-emerald-500">
          <CheckCircle2 className="size-6" />
        </span>
        <p className="text-sm text-muted-foreground">You&apos;re all set. Let&apos;s choose how you&apos;ll use Shortster.</p>
        <Button className="w-full" onClick={finishVerifiedIntro}>
          Continue
        </Button>
      </div>
    </AuthShell>
  )
}
