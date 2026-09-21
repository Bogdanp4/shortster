"use client"

import Link from "next/link"
import { Logo } from "@/components/app/logo"
import { Button } from "@/components/ui/button"
import { LanguageSelector } from "@/components/i18n/language-selector"
import { useAuth } from "./auth-provider"
import { useT } from "@/components/i18n/locale-provider"
import { Sparkles, Megaphone, ShieldCheck } from "lucide-react"

export function LandingView() {
  const { navigateAuth } = useAuth()
  const t = useT()

  const benefits = [
    { icon: Sparkles, title: t("landing.card1Title"), description: t("landing.card1Body") },
    { icon: Megaphone, title: t("landing.card2Title"), description: t("landing.card2Body") },
    { icon: ShieldCheck, title: t("landing.card3Title"), description: t("landing.card3Body") },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-16 items-center justify-between px-4 lg:px-8">
        <Logo />
        <LanguageSelector />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-10">
        <div className="flex w-full max-w-2xl flex-col items-center gap-8 text-center">
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t("landing.headline")}</h1>
            <p className="mx-auto max-w-lg text-base text-muted-foreground">{t("landing.subtitle")}</p>
          </div>

          <div className="flex w-full max-w-xs flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
            <Button size="lg" className="w-full sm:w-auto" onClick={() => navigateAuth("signup")}>
              {t("landing.createAccount")}
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto" onClick={() => navigateAuth("login")}>
              {t("landing.signIn")}
            </Button>
          </div>

          <div className="mt-4 grid w-full gap-4 sm:grid-cols-3">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-card/40 p-4 text-center"
              >
                <span className="flex size-9 items-center justify-center rounded-md bg-primary/12 text-primary">
                  <b.icon className="size-4.5" />
                </span>
                <p className="text-sm font-medium">{b.title}</p>
                <p className="text-xs text-muted-foreground">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="flex flex-col items-center gap-2 px-4 py-6 text-center text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <Link href="/terms" className="hover:text-foreground hover:underline">
            {t("footer.terms")}
          </Link>
          <Link href="/privacy" className="hover:text-foreground hover:underline">
            {t("footer.privacy")}
          </Link>
        </div>
        <p>
          &copy; {new Date().getFullYear()} {t("brand.name")}. {t("footer.rights")}
        </p>
      </footer>
    </div>
  )
}
