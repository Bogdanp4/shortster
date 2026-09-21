// Developer-only prototype flag.
//
// Must be `false` in production. It exists solely to let a developer preview
// every workspace (Creator / Advertiser / Moderator / Admin) from a single
// session while building the prototype. It must never surface in a normal
// authenticated user's session — role there comes exclusively from
// `AuthUser.roles` / `AuthUser.activeWorkspace` (see auth-provider.tsx).
export const DEMO_ROLE_OVERRIDE_ENABLED = false

// Whether the auth screens show the "Continue with a demo account" affordances
// by default. Off in real deployments; set NEXT_PUBLIC_DEMO_MODE=true (e.g. in
// a preview/staging environment) to re-enable it without a code change.
export function getDefaultDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true"
}
