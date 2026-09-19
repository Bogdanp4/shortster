"use client"

import { useState } from "react"
import { Plus, Copy, ShieldCheck, Info, RefreshCw, Trash2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

import { useApp } from "@/components/app/app-provider"
import { formatNumber } from "@/lib/format"
import type { Platform, SocialAccount } from "@/lib/types"
import { PageHeader } from "@/components/shared/page-header"
import { PlatformIcon, platformLabel } from "@/components/shared/platform-icon"
import { VerificationStatusBadge } from "@/components/shared/status-badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { InputGroup, InputGroupInput, InputGroupAddon, InputGroupButton } from "@/components/ui/input-group"

const methodLabels: Record<string, string> = {
  oauth: "OAuth",
  google: "Google Sign-in",
  bio_challenge: "Bio challenge",
}

function randomChallenge() {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `shortster-${rand}`
}

export function SocialAccountsView() {
  const { socialAccounts, addSocialAccount, updateSocialAccount, removeSocialAccount } = useApp()

  const [connectOpen, setConnectOpen] = useState(false)
  const [challengeOpen, setChallengeOpen] = useState(false)
  const [challenge, setChallenge] = useState(randomChallenge())
  const [igHandle, setIgHandle] = useState("")
  const [challengeAccountId, setChallengeAccountId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<SocialAccount | null>(null)

  function copyChallenge() {
    navigator.clipboard?.writeText(challenge)
    setCopied(true)
    toast.success("Challenge code copied")
    setTimeout(() => setCopied(false), 1500)
  }

  function connectOauth(platform: Platform, method: "oauth" | "google") {
    const handle = platform === "youtube" ? "@new_youtube_channel" : "@new_tiktok_creator"
    addSocialAccount({
      id: `sa-${Date.now()}`,
      platform,
      handle,
      displayName: handle.replace("@", ""),
      followers: Math.floor(20000 + Math.random() * 80000),
      method,
      status: "verified",
      connectedAt: "Just now",
    })
    setConnectOpen(false)
    toast.success(`${platformLabel(platform)} account connected and verified`)
  }

  function startIgChallenge() {
    const handle = igHandle.trim() ? (igHandle.startsWith("@") ? igHandle : `@${igHandle}`) : "@new_instagram"
    const id = `sa-${Date.now()}`
    const fresh = randomChallenge()
    setChallenge(fresh)
    addSocialAccount({
      id,
      platform: "instagram",
      handle,
      displayName: handle.replace("@", ""),
      followers: Math.floor(15000 + Math.random() * 60000),
      method: "bio_challenge",
      status: "challenge_created",
      connectedAt: "Just now",
    })
    setChallengeAccountId(id)
    setConnectOpen(false)
    setChallengeOpen(true)
    toast.info("Bio challenge created. Add the code to your Instagram bio.")
  }

  function verifyChallenge() {
    if (!challengeAccountId) return
    updateSocialAccount(challengeAccountId, { status: "pending" })
    setChallengeOpen(false)
    toast.info("Checking your bio…")
    setTimeout(() => {
      updateSocialAccount(challengeAccountId, { status: "verified" })
      toast.success("Instagram account verified")
    }, 1600)
  }

  function reconnect(account: SocialAccount) {
    if (account.method === "bio_challenge") {
      const fresh = randomChallenge()
      setChallenge(fresh)
      setChallengeAccountId(account.id)
      updateSocialAccount(account.id, { status: "challenge_created" })
      setChallengeOpen(true)
      return
    }
    updateSocialAccount(account.id, { status: "pending" })
    toast.info(`Reconnecting ${account.handle}…`)
    setTimeout(() => {
      updateSocialAccount(account.id, { status: "verified" })
      toast.success(`${account.handle} reconnected`)
    }, 1400)
  }

  function confirmRemove() {
    if (!removeTarget) return
    removeSocialAccount(removeTarget.id)
    toast.success(`${removeTarget.handle} removed`)
    setRemoveTarget(null)
  }

  const pendingChallenge = socialAccounts.some(
    (a) => a.status === "challenge_created" || a.status === "pending",
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Social Accounts"
        description="Connect and verify the accounts you post from. Only verified accounts can submit videos."
      >
        <Dialog open={connectOpen} onOpenChange={setConnectOpen}>
          <Button onClick={() => setConnectOpen(true)}>
            <Plus data-icon="inline-start" />
            Connect account
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Connect a social account</DialogTitle>
              <DialogDescription>Choose how you want to verify ownership of this account.</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3">
              <Button variant="outline" className="justify-start" onClick={() => connectOauth("tiktok", "oauth")}>
                <PlatformIcon platform="tiktok" className="size-4" />
                Connect TikTok with OAuth
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => connectOauth("youtube", "google")}>
                <PlatformIcon platform="youtube" className="size-4" />
                Connect YouTube with Google
              </Button>
              <Separator />
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">Verify Instagram with a bio challenge</p>
                <p className="text-xs text-muted-foreground">
                  Instagram has no OAuth for this, so we verify by having you paste a one-time code into your bio.
                </p>
                <InputGroup>
                  <InputGroupInput
                    placeholder="@your_instagram"
                    value={igHandle}
                    onChange={(e) => setIgHandle(e.target.value)}
                  />
                  <InputGroupAddon>
                    <PlatformIcon platform="instagram" className="size-4" />
                  </InputGroupAddon>
                </InputGroup>
                <Button variant="secondary" onClick={startIgChallenge}>
                  Create bio challenge
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Alert>
        <ShieldCheck />
        <AlertTitle>Why verification matters</AlertTitle>
        <AlertDescription>
          Verifying ownership prevents others from claiming your videos and lets us pay you accurately based on real
          view counts.
        </AlertDescription>
      </Alert>

      {socialAccounts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <ShieldCheck className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium">No accounts connected</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Connect at least one verified account before you can submit videos to campaigns.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {socialAccounts.map((account) => (
            <Card key={account.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                      <PlatformIcon platform={account.platform} className="size-5" />
                    </div>
                    <div className="flex flex-col">
                      <CardTitle className="text-base">{account.handle}</CardTitle>
                      <CardDescription>{formatNumber(account.followers)} followers</CardDescription>
                    </div>
                  </div>
                  <VerificationStatusBadge status={account.status} />
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Method</span>
                  <Badge variant="secondary">{methodLabels[account.method]}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Connected</span>
                  <span>{account.connectedAt}</span>
                </div>
                {account.status === "challenge_created" && (
                  <Button size="sm" variant="secondary" onClick={() => reconnect(account)}>
                    <CheckCircle2 data-icon="inline-start" />
                    Complete verification
                  </Button>
                )}
                <Separator />
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => reconnect(account)}>
                    <RefreshCw data-icon="inline-start" />
                    Reconnect
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setRemoveTarget(account)}
                    aria-label={`Remove ${account.handle}`}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {pendingChallenge && (
        <Alert>
          <Info />
          <AlertTitle>Bio challenge pending</AlertTitle>
          <AlertDescription>
            A verification can take up to 30 minutes after you update your bio. We&apos;ll notify you when it completes.
          </AlertDescription>
        </Alert>
      )}

      {/* Bio challenge dialog */}
      <Dialog open={challengeOpen} onOpenChange={setChallengeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify with a bio challenge</DialogTitle>
            <DialogDescription>
              Add this code anywhere in your Instagram bio, then verify. You can remove it once verification completes.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <InputGroup>
              <InputGroupInput readOnly value={challenge} />
              <InputGroupAddon align="inline-end">
                <InputGroupButton onClick={copyChallenge}>
                  <Copy data-icon="inline-start" />
                  {copied ? "Copied" : "Copy"}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            <p className="text-xs text-muted-foreground">
              Tip: paste it at the end of your bio. Our checker scans for the exact code.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChallengeOpen(false)}>
              Later
            </Button>
            <Button onClick={verifyChallenge}>
              <CheckCircle2 data-icon="inline-start" />
              I&apos;ve added it — verify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove confirmation */}
      <Dialog open={!!removeTarget} onOpenChange={(open) => !open && setRemoveTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove {removeTarget?.handle}?</DialogTitle>
            <DialogDescription>
              You won&apos;t be able to submit videos from this account until you reconnect and verify it again. Existing
              submissions are unaffected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmRemove}>
              <Trash2 data-icon="inline-start" />
              Remove account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
