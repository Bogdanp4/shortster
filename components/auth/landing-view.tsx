"use client"

import { Logo } from "@/components/app/logo"
import { Button } from "@/components/ui/button"
import { useAuth } from "./auth-provider"
import { Sparkles, Megaphone, ShieldCheck } from "lucide-react"

const benefits = [
  {
    icon: Sparkles,
    title: "Earn from performance",
    description: "Creators get paid based on verified views, not promises.",
  },
  {
    icon: Megaphone,
    title: "Verified distribution",
    description: "Advertisers reach real audiences through checked accounts.",
  },
  {
    icon: ShieldCheck,
    title: "Fraud-checked payouts",
    description: "Every submission is reviewed before a reward is released.",
  },
]

export function LandingView() {
  const { navigateAuth } = useAuth()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-16 items-center px-4 lg:px-8">
        <Logo />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-10">
        <div className="flex w-full max-w-2xl flex-col items-center gap-8 text-center">
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Turn short-form content into measurable growth.
            </h1>
            <p className="mx-auto max-w-lg text-base text-muted-foreground">
              Creators earn from campaign performance. Advertisers get verified short-form distribution.
            </p>
          </div>

          <div className="flex w-full max-w-xs flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
            <Button size="lg" className="w-full sm:w-auto" onClick={() => navigateAuth("signup")}>
              Create Account
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto" onClick={() => navigateAuth("login")}>
              Sign In
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

      <footer className="px-4 py-6 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} Shortster. All rights reserved.
      </footer>
    </div>
  )
}
