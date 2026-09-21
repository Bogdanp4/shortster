import type { Notification } from "@/lib/types"
import { mockDelay, store } from "./store"
import type { Result } from "./types"

export async function getNotifications(): Promise<Result<Notification[]>> {
  await mockDelay()
  return { ok: true, data: store.notifications }
}

export async function markRead(id: string): Promise<Result<Notification[]>> {
  store.notifications = store.notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
  return { ok: true, data: store.notifications }
}
