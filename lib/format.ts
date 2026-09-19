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
