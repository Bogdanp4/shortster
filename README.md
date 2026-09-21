# Shortster

Shortster is a demo/prototype platform connecting **advertisers** running short-form video
campaigns with **creators** who submit qualifying content for performance-based rewards. A
third role, **moderator**, reviews submissions and fraud flags.

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

> **Status: front-end prototype.** All data (users, campaigns, submissions, transactions) is
> mock data held in memory — see [`lib/mock-data.ts`](./lib/mock-data.ts) and
> [`lib/auth-mock-data.ts`](./lib/auth-mock-data.ts). Nothing persists across a page reload and
> there is no real backend, database, or payment processor wired up yet. See
> [`FRONTEND_HANDOFF.md`](./FRONTEND_HANDOFF.md) for what a backend integration needs to cover.

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_9r8gCTbKI9DY9M0XLocaC0OIOvrU)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Use the role switcher on the landing/login screen (or the account menu once signed in) to explore
the **creator**, **advertiser**, and **moderator** experiences with mock data.

## Project structure

- `app/` — Next.js App Router entry points (`page.tsx` is the single-page app shell; `terms/`
  and `privacy/` are standalone static pages).
- `components/app/` — app shell, dashboard layout, sidebar/nav, view router (client-side view
  switching — see [`FRONTEND_HANDOFF.md`](./FRONTEND_HANDOFF.md) for the routing follow-up).
- `components/auth/` — landing, login, signup, and the mock `AuthProvider`.
- `components/views/{creator,advertiser,moderator,admin}/` — role-specific screens.
- `components/shared/` — cross-role UI (status badges, page headers, stat cards, etc).
- `lib/i18n/` — English/Russian UI dictionaries and the locale provider (`useT()`).
- `lib/mock-data.ts`, `lib/auth-mock-data.ts` — in-memory demo data.
- `lib/format.ts` — locale-aware currency/number/date formatting helpers.
- `lib/domain/money.ts` — money-handling utilities (see handoff doc for the minor-units migration).

## Internationalization

UI copy is centralized in `lib/i18n/en.ts` and `lib/i18n/ru.ts` and accessed via the `useT()`
hook from `components/i18n/locale-provider`. Dynamic user data (names, campaign titles, handles)
is intentionally never translated. When adding UI text, add the key to both dictionaries.

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.
