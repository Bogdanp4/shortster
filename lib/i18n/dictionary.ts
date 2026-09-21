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
  const primary = lookup(dictionaries[locale], key)
  // Missing translation: fall back to English so the UI never breaks, but warn
  // in development so gaps get noticed instead of silently living forever.
  if (primary == null && process.env.NODE_ENV !== "production") {
    warnMissing(locale, key)
  }
  const resolved = primary ?? lookup(dictionaries.en, key)
  if (resolved == null) return key
  if (!vars) return resolved
  return resolved.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  )
}

const warned = new Set<string>()

function warnMissing(locale: Locale, key: string) {
  const id = `${locale}:${key}`
  if (warned.has(id)) return
  warned.add(id)
  console.warn(`[v0] Missing translation key: "${key}" for locale "${locale}"`)
}

// Flatten a nested dictionary into dot-path keys ("auth.loginTitle").
function flattenKeys(obj: unknown, prefix = ""): string[] {
  if (!obj || typeof obj !== "object") return []
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) => {
    const path = prefix ? `${prefix}.${k}` : k
    return typeof v === "object" && v !== null ? flattenKeys(v, path) : [path]
  })
}

// Dev-time parity check: report keys present in one locale but missing in the
// other. Runs once at module load in development.
export function checkTranslationParity(): { missingInRu: string[]; missingInEn: string[] } {
  const enKeys = new Set(flattenKeys(dictionaries.en))
  const ruKeys = new Set(flattenKeys(dictionaries.ru))
  const missingInRu = [...enKeys].filter((k) => !ruKeys.has(k))
  const missingInEn = [...ruKeys].filter((k) => !enKeys.has(k))
  return { missingInRu, missingInEn }
}

if (process.env.NODE_ENV !== "production") {
  const { missingInRu, missingInEn } = checkTranslationParity()
  if (missingInRu.length) console.warn("[v0] Keys missing in ru:", missingInRu)
  if (missingInEn.length) console.warn("[v0] Keys missing in en:", missingInEn)
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
