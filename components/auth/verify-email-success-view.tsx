"use client"

import { AuthShell } from "./auth-shell"
import { useAuth } from "./auth-provider"
import { useT } from "@/components/i18n/locale-provider"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

export function VerifyEmailSuccessView() {
  const { finishVerifiedIntro } = useAuth()
  const t = useT()

  return (
    <AuthShell title={t("auth.verifiedTitle")} description={t("auth.verifiedSubtitle")}>
      <div className="flex flex-col items-center gap-5 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-emerald-500/12 text-emerald-500">
          <CheckCircle2 className="size-6" />
        </span>
        <p className="text-sm text-muted-foreground">{t("auth.verifiedBody")}</p>
        <Button className="w-full" onClick={finishVerifiedIntro}>
          {t("common.continue")}
        </Button>
      </div>
    </AuthShell>
  )
}
