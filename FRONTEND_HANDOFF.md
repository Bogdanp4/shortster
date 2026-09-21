# Frontend → Backend Handoff

This app is currently a **front-end prototype**: every user, campaign, submission, and
transaction lives in memory (`lib/mock-data.ts`, `lib/auth-mock-data.ts`) and resets on reload.
This document is a checklist for wiring up a real backend.

## 1. Data model

`lib/types.ts` is the source of truth for shapes currently used by the UI: `User`, `Campaign`,
`Submission`, `Transaction`, `FraudFlag`, etc. Use it as the starting point for a database
schema, but expect to add fields the mock layer doesn't need (timestamps, foreign keys, audit
fields, soft-delete flags).

## 2. Money handling (important — do this before going live)

All money in the UI today is a **plain JS number of whole currency units** (e.g. `42.50` means
$42.50), formatted with `formatCurrency()` in `lib/format.ts`. This is fine for a prototype but
is not safe for real financial data — floating point arithmetic on currency amounts can
introduce rounding errors.

`lib/domain/money.ts` contains minor-units helpers (`toMinorUnits`, `fromMinorUnits`,
`addMoney`, etc.) intended for a follow-up migration: store and compute all money server-side as
integer minor units (cents), and only convert to/from major units at the display boundary. This
migration was **intentionally deferred** — it touches money fields across mock data, every view
that displays a rate/balance/budget, and any future API contracts — and should happen alongside
backend integration rather than as an isolated UI refactor.

## 3. Auth

`components/auth/auth-provider.tsx` is a mock auth context (`navigateAuth`, `login`, `signup`,
`logout`) backed by `lib/auth-mock-data.ts`. Replace it with a real provider (see the project's
`better-auth` skill/guidance) while keeping the same context shape (`user`, `role`,
`navigateAuth`, `login`, `signup`, `logout`) so consuming components don't need to change.

## 4. Routing

The app currently renders as a single page (`app/page.tsx`) with client-side view switching via
`components/app/view-router.tsx` and `lib/nav.ts` (a view-id enum, not URL routes). There are no
deep-linkable URLs for individual campaigns, submissions, etc. (`/terms` and `/privacy` are the
only real Next.js routes.)

Follow-up: migrate to real App Router routes per role (e.g. `/creator/campaigns/[id]`,
`/advertiser/campaigns/[id]/submissions`, `/moderator/review/[id]`) so views are linkable,
back/forward navigation works, and each view can fetch its own data server-side. This is a
larger structural change and should be planned as its own pass once the backend/API shape is
known.

## 5. Fraud review

Fraud flags are currently reviewed inline on the submission detail view
(`components/views/moderator/review-detail-view.tsx`) rather than a separate fraud queue page —
the previous standalone `fraud-review-view.tsx` was removed as dead code. Confirm this is still
the desired moderation flow before building a fraud API.

## 6. What to build, roughly in order

1. Database schema from `lib/types.ts` (Neon/Postgres recommended — see the `neon-on-vercel`
   skill).
2. Real auth (Better Auth), replacing `auth-mock-data.ts` and `auth-provider.tsx`.
3. Money minor-units migration (`lib/domain/money.ts`) alongside API/schema work.
4. Server data fetching (Server Components / SWR) to replace the in-memory arrays in
   `lib/mock-data.ts`, one view at a time.
5. Real routes per the plan in section 4, once the API shape is stable.
6. Payment provider integration (Stripe) for advertiser deposits and creator withdrawals.
