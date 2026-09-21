import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy — Shortster",
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-12">
      <Link href="/" className="text-sm text-muted-foreground hover:text-foreground hover:underline">
        &larr; Back to Shortster
      </Link>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Privacy Policy</h1>
        <span className="inline-flex w-fit items-center rounded-sm bg-amber-500/15 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
          Draft — requires legal review
        </span>
      </div>

      <div className="flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          This placeholder describes, at a high level, the data Shortster collects and how it is used. It is not
          final legal copy and must be reviewed and approved by counsel before publication.
        </p>
        <section className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold text-foreground">1. Information we collect</h2>
          <p>
            Account details (name, email, role), connected social account identifiers and public metrics, submitted
            video links and verification data, and payout/billing information needed to process withdrawals and
            deposits.
          </p>
        </section>
        <section className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold text-foreground">2. How we use information</h2>
          <p>
            To operate campaign matching, verify submission eligibility, calculate and issue rewards, detect fraud,
            and communicate account and campaign updates.
          </p>
        </section>
        <section className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold text-foreground">3. Sharing</h2>
          <p>
            Advertisers see aggregated campaign performance and submission metadata for their own campaigns.
            Shortster does not sell personal information to third parties.
          </p>
        </section>
        <section className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold text-foreground">4. Data retention</h2>
          <p>
            Account and transaction records are retained as long as needed for platform operation, fraud prevention,
            and legal/financial recordkeeping requirements.
          </p>
        </section>
        <section className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold text-foreground">5. Contact</h2>
          <p>Questions about this policy can be directed to Shortster support.</p>
        </section>
      </div>
    </main>
  )
}
