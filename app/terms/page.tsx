import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service — Shortster",
}

export default function TermsPage() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-12">
      <Link href="/" className="text-sm text-muted-foreground hover:text-foreground hover:underline">
        &larr; Back to Shortster
      </Link>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Terms of Service</h1>
        <span className="inline-flex w-fit items-center rounded-sm bg-amber-500/15 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
          Draft — requires legal review
        </span>
      </div>

      <div className="flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          This placeholder outlines the terms under which creators and advertisers use the Shortster platform. It is
          not final legal copy and must be reviewed and approved by counsel before publication.
        </p>
        <section className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold text-foreground">1. Platform role</h2>
          <p>
            Shortster connects advertisers running short-form content campaigns with creators who submit qualifying
            videos for performance-based rewards. Shortster facilitates matching, verification, and payouts but does
            not guarantee campaign outcomes.
          </p>
        </section>
        <section className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold text-foreground">2. Accounts and eligibility</h2>
          <p>
            Users must provide accurate account information and connect only social accounts they own or are
            authorized to represent. Shortster may suspend accounts found to violate campaign requirements or engage
            in fraudulent activity.
          </p>
        </section>
        <section className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold text-foreground">3. Rewards and payouts</h2>
          <p>
            Creator rewards are calculated from verified view counts against each campaign&apos;s published rate and
            limits. Payouts are subject to minimum withdrawal thresholds and fraud review before funds are released.
          </p>
        </section>
        <section className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold text-foreground">4. Advertiser budgets</h2>
          <p>
            Advertisers deposit funds to reserve campaign budgets. Unused reserved budget is returned according to
            Shortster&apos;s campaign cancellation policy.
          </p>
        </section>
        <section className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold text-foreground">5. Changes to these terms</h2>
          <p>Shortster may update these terms from time to time. Continued use of the platform constitutes acceptance of the current terms.</p>
        </section>
      </div>
    </main>
  )
}
