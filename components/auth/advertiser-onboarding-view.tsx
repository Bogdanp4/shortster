"use client"

import { useState } from "react"
import { AuthShell } from "./auth-shell"
import { useAuth } from "./auth-provider"
import { useT } from "@/components/i18n/locale-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"

export function AdvertiserOnboardingView() {
  const { completeAdvertiserOnboarding, currentUser } = useAuth()
  const t = useT()
  const fallbackName = currentUser?.email.split("@")[0] ?? ""
  const [companyName, setCompanyName] = useState(currentUser?.name ?? "")
  const [website, setWebsite] = useState("")

  function finish(name: string) {
    completeAdvertiserOnboarding({
      companyName: name.trim() || fallbackName,
      website: website.trim() || undefined,
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    finish(companyName)
  }

  return (
    <AuthShell title={t("auth.brandTitle")} description={t("auth.brandSubtitle")} className="max-w-md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="brand-name">{t("auth.brandName")}</FieldLabel>
            <Input
              id="brand-name"
              placeholder={t("auth.brandNamePlaceholder")}
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              autoFocus
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="brand-website">
              {t("auth.website")} <span className="text-muted-foreground">({t("common.optional")})</span>
            </FieldLabel>
            <Input
              id="brand-website"
              placeholder={t("auth.websitePlaceholder")}
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </Field>

          <div className="flex flex-col gap-2">
            <Button type="submit" className="w-full">
              {t("common.continue")}
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={() => finish(companyName)}>
              {t("common.skip")}
            </Button>
          </div>
        </FieldGroup>
      </form>
    </AuthShell>
  )
}
