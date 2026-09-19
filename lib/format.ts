export function formatMoney(value: number, opts?: { compact?: boolean }): string {
  if (opts?.compact && Math.abs(value) >= 1000) {
    return "$" + compactNumber(value)
  }
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function formatMoneySigned(value: number): string {
  const sign = value >= 0 ? "+" : "-"
  return sign + formatMoney(Math.abs(value))
}

export function formatNumber(value: number): string {
  return value.toLocaleString("en-US")
}

// Alias kept for view components that import `formatCurrency`.
export const formatCurrency = formatMoney

export function formatRelative(input: string | number | Date): string {
  const date = input instanceof Date ? input : new Date(input)
  const time = date.getTime()
  // Some mock values are already display-ready relative labels (e.g. "12 min ago").
  // If the input can't be parsed as a date, show it as-is instead of crashing.
  if (!Number.isFinite(time)) return typeof input === "string" ? input : "—"
  const diffMs = time - Date.now()
  const abs = Math.abs(diffMs)
  const minutes = Math.round(abs / 60000)
  const hours = Math.round(abs / 3_600_000)
  const days = Math.round(abs / 86_400_000)
  const rtf = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" })
  const sign = diffMs >= 0 ? 1 : -1
  if (minutes < 60) return rtf.format(sign * minutes, "minute")
  if (hours < 24) return rtf.format(sign * hours, "hour")
  return rtf.format(sign * days, "day")
}

export function compactNumber(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return (value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1) + "M"
  }
  if (Math.abs(value) >= 1_000) {
    return (value / 1_000).toFixed(value % 1_000 === 0 ? 0 : 1) + "K"
  }
  return String(value)
}

// reward = views * (rate per 1,000,000 views)
export function computeReward(views: number, ratePerMillion: number): number {
  return (views / 1_000_000) * ratePerMillion
}

export function percent(part: number, whole: number): number {
  if (whole === 0) return 0
  return Math.min(100, Math.round((part / whole) * 100))
}
