import type { AuthUser } from "./types"

// Client-side mock "database". Resets on full page reload — this prototype has no real backend.
// Passwords are stored as plain strings prefixed with `mock:` to make it obvious this is not real hashing.
export function mockHash(password: string) {
  return `mock:${password}`
}

function user(partial: Omit<AuthUser, "passwordHash" | "createdAt" | "updatedAt"> & { password: string }): AuthUser {
  const { password, ...rest } = partial
  return {
    ...rest,
    passwordHash: mockHash(password),
    createdAt: "Jan 3, 2025",
    updatedAt: "Jan 3, 2025",
  }
}

// Demo accounts — Development Preview only. Never surfaced to production users.
export const demoUsers: AuthUser[] = [
  user({
    id: "demo-creator",
    email: "alex@shortster.demo",
    password: "demo1234",
    name: "Alex Carter",
    status: "active",
    roles: ["creator"],
    activeWorkspace: "creator",
    emailVerified: true,
    onboardingCompleted: true,
  }),
  user({
    id: "demo-advertiser",
    email: "ads@stake.demo",
    password: "demo1234",
    name: "Stake Media",
    status: "active",
    roles: ["advertiser"],
    activeWorkspace: "advertiser",
    emailVerified: true,
    onboardingCompleted: true,
    advertiserProfile: {
      companyName: "Stake Media",
      country: "United Kingdom",
      industry: "iGaming",
      primaryCategory: "clipping",
      primaryMarket: "en",
    },
  }),
  user({
    id: "demo-moderator",
    email: "mod@shortster.demo",
    password: "demo1234",
    name: "Morgan Lee",
    status: "active",
    roles: ["moderator"],
    activeWorkspace: "moderator",
    emailVerified: true,
    onboardingCompleted: true,
  }),
  user({
    id: "demo-admin",
    email: "admin@shortster.demo",
    password: "demo1234",
    name: "Admin",
    status: "active",
    roles: ["admin"],
    activeWorkspace: "admin",
    emailVerified: true,
    onboardingCompleted: true,
  }),
  // Multi-role account for the Workspace Switcher QA path.
  user({
    id: "demo-multi",
    email: "jordan@shortster.demo",
    password: "demo1234",
    name: "Jordan Blake",
    status: "active",
    roles: ["creator", "advertiser"],
    activeWorkspace: "creator",
    emailVerified: true,
    onboardingCompleted: true,
    advertiserProfile: {
      companyName: "Blake Growth Co",
      country: "Canada",
      industry: "SaaS",
      primaryCategory: "any",
      primaryMarket: "en",
    },
  }),
]

// Fixed accounts covering each Sign In error/state from the spec.
export const qaAccounts: AuthUser[] = [
  user({
    id: "qa-unverified",
    email: "creator@example.com",
    password: "password123",
    name: "Pending Creator",
    status: "email_verification_required",
    roles: [],
    activeWorkspace: "creator",
    emailVerified: false,
    onboardingCompleted: false,
  }),
  user({
    id: "qa-suspended",
    email: "suspended@example.com",
    password: "password123",
    name: "Suspended User",
    status: "suspended",
    roles: ["creator"],
    activeWorkspace: "creator",
    emailVerified: true,
    onboardingCompleted: true,
  }),
  user({
    id: "qa-banned",
    email: "banned@example.com",
    password: "password123",
    name: "Banned User",
    status: "banned",
    roles: ["creator"],
    activeWorkspace: "creator",
    emailVerified: true,
    onboardingCompleted: true,
  }),
]

export const seedAccountsDb: AuthUser[] = [...demoUsers, ...qaAccounts]
