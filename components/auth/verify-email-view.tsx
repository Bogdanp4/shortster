"use client"

import { toast } from "sonner"
import { AuthShell } from "./auth-shell"
import { useAuth } from "./auth-provider"
import { useT } from "@/components/i18n/locale-provider"
import { Button } from "@/components/ui/button"
import { MailCheck, CheckCircle2 } from "lucide-react"

export function VerifyEmailView() {
  const { pendingEmail, resendVerification, verifyEmailMock, signOut } = useAuth()
  const t = useT()

  return (
    <AuthShell title={t("auth.verifyTitle")} description={t("auth.verifySubtitle")}>
      <div className="flex flex-col items-center gap-5 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-primary/12 text-primary">
          <MailCheck className="size-6" />
        </span>
        <p className="text-sm text-muted-foreground">
          {t("auth.verifySentTo")}{" "}
          <span className="font-medium text-foreground">{pendingEmail ?? t("auth.yourEmail")}</span>.{" "}
          {t("auth.verifyClickLink")}
        </p>

        {/* Prototype shortcut — a real deployment verifies via the emailed link, not a button. */}
        <Button className="w-full" onClick={verifyEmailMock}>
          <CheckCircle2 className="size-4" />
          {t("auth.verifiedDemo")}
        </Button>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            resendVerification()
            toast.success(t("auth.verificationResent"))
          }}
        >
          {t("auth.resendVerification")}
        </Button>

        <button type="button" onClick={signOut} className="text-sm text-muted-foreground hover:text-foreground">
          {t("auth.backToSignIn")}
        </button>
      </div>
    </AuthShell>
  )
}
