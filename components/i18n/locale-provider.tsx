"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { translate, type Locale } from "@/lib/i18n/dictionary"
import { setFormatLocale } from "@/lib/format"

const STORAGE_KEY = "shortster_locale"

interface LocaleContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, vars?: Record<string, string | number>) => string
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

function readStoredLocale(): Locale | null {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    return saved === "en" || saved === "ru" ? saved : null
  } catch {
    return null
  }
}

function detectBrowserLocale(): Locale {
  const lang = window.navigator.language?.toLowerCase() ?? "en"
  return lang.startsWith("ru") ? "ru" : "en"
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  // Start from "en" for a deterministic server/client first paint, then adopt the
  // stored or browser-detected locale after mount to avoid hydration mismatches.
  const [locale, setLocaleState] = useState<Locale>("en")

  useEffect(() => {
    const next = readStoredLocale() ?? detectBrowserLocale()
    setLocaleState(next)
    setFormatLocale(next)
    document.documentElement.lang = next
  }, [])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    setFormatLocale(next)
    document.documentElement.lang = next
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Ignore storage failures (private mode, disabled storage).
    }
  }, [])

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key, vars) => translate(locale, key, vars),
    }),
    [locale, setLocale],
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error("useLocale must be used within a LocaleProvider")
  return ctx
}

// Convenience hook for components that only need the translator.
export function useT() {
  return useLocale().t
}
