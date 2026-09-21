# Frontend → Backend Handoff

This app is currently a **front-end prototype**: every user, campaign, submission, and
transaction lives in memory (`lib/mock-data.ts`, `lib/auth-mock-data.ts`) and resets on reload.
This document is a checklist for wiring up a real backend.

## 1. Data model

`lib/types.ts` is the source of truth for shapes currently used by the UI: `User`, `Campaign`,
`Submission`, `Transaction`, `FraudFlag`, etc. Use it as the starting point for a database
schema, but expect to add fields the mock layer doesn't need (timestamps, foreign keys, audit
fields, soft-delete flags).

## 2. Money handling

All money fields (`*Minor` suffix: `availableMinor`, `budgetMinor`, `ratePerMillionViewsMinor`,
etc.) are stored as **integer minor units** (cents) throughout `lib/types.ts`, `lib/mock-data.ts`,
and every service in `services/`. `lib/domain/money.ts` holds the integer-safe arithmetic
(`calculateReward`, `calculatePlatformFee`, `calculateCampaignReserve`, `calculateFinalReward`,
etc.) — components never do money arithmetic inline, they call these helpers or the service
layer. `formatMoney()` / `formatCurrency()` in `lib/format.ts` take minor units and divide by 100
only at the display boundary.

When wiring a real database, keep amounts as integer columns (cents) and keep all
addition/subtraction/percentage math server-side using the same integer-only approach — never
reintroduce floating-point currency math.

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

## 6. Service layer

`services/` contains an async, mock-backed service per domain (`campaign-service.ts`,
`submission-service.ts`, `moderation-service.ts`, `wallet-service.ts`, `withdrawal-service.ts`,
`billing-service.ts`, `fraud-service.ts`, `social-account-service.ts`,
`notification-service.ts`). Each currently reads/writes an in-memory store seeded from
`lib/mock-data.ts` (`services/store.ts`) with artificial latency, but the function signatures are
already async and return the `Result<T>` shape from `services/types.ts` — `AppProvider` and views
call these services rather than mutating state directly. Swapping a service's internals to call a
real API/database should not require call-site changes in components.

Validation that currently lives in these mock services (min-withdrawal amount, budget checks,
duplicate submission checks) must be re-implemented server-side for real — never trust the
client — but the same function boundaries are a reasonable guide for where that logic belongs.

## 7. What to build, roughly in order

1. Database schema from `lib/types.ts` (Neon/Postgres recommended — see the `neon-on-vercel`
   skill), with money columns as integers (minor units).
2. Real auth (Better Auth), replacing `auth-mock-data.ts` and `auth-provider.tsx`.
3. Replace each mock service's internals (`services/*.ts`) with real API/database calls, one
   domain at a time, keeping the existing function signatures so components don't change.
4. Server data fetching (Server Components / SWR) to replace client-side `useEffect` loads where
   present.
5. Real routes per the plan in section 4, once the API shape is stable.
6. Payment provider integration (Stripe) for advertiser deposits and creator withdrawals.
