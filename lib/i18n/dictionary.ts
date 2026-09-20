import { en } from "./en"
import { ru } from "./ru"

export type Locale = "en" | "ru"

export const locales: Locale[] = ["en", "ru"]

export const dictionaries = { en, ru } as const

// Resolve a dot-path key ("auth.loginTitle") against a locale dictionary and
// interpolate {var} placeholders. Falls back to English, then to the raw key,
// so a missing translation degrades gracefully instead of throwing.
export function translate(
  locale: Locale,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const resolved = lookup(dictionaries[locale], key) ?? lookup(dictionaries.en, key)
  if (resolved == null) return key
  if (!vars) return resolved
  return resolved.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  )
}

function lookup(dict: unknown, key: string): string | undefined {
  const value = key.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part]
    }
    return undefined
  }, dict)
  return typeof value === "string" ? value : undefined
}
