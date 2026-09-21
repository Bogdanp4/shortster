import type { AdvertiserWallet, CreatorWallet, WalletTransaction } from "@/lib/types"
import { mockDelay, store } from "./store"
import type { Result } from "./types"

export async function getCreatorWallet(): Promise<Result<CreatorWallet>> {
  await mockDelay()
  return { ok: true, data: store.creatorWallet }
}

export async function getCreatorTransactions(): Promise<Result<WalletTransaction[]>> {
  await mockDelay()
  return { ok: true, data: store.creatorTransactions }
}

export async function getAdvertiserWallet(): Promise<Result<AdvertiserWallet>> {
  await mockDelay()
  return { ok: true, data: store.advertiserWallet }
}

export async function getAdvertiserTransactions(): Promise<Result<WalletTransaction[]>> {
  await mockDelay()
  return { ok: true, data: store.advertiserTransactions }
}
