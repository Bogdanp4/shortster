"use client"

import { useState } from "react"
import { Plus, Copy, ShieldCheck, Info, RefreshCw, Trash2, CheckCircle2, AlertTriangle, Zap, Eye } from "lucide-react"
import { toast } from "sonner"

import { useApp } from "@/components/app/app-provider"
import { useT } from "@/components/i18n/locale-provider"
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

function randomChallenge() {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `shortster-${rand}`
}

export function SocialAccountsView() {
  const t = useT()
  const { socialAccounts, addSocialAccount, updateSocialAccount, removeSocialAccount } = useApp()

  const methodLabels: Record<string, string> = {
    oauth: t("social.methodOauth"),
    google: t("social.methodGoogle"),
    bio_challenge: t("social.methodBioChallenge"),
  }

  const metricsModeLabels: Record<string, string> = {
    automatic: t("social.metricsAutomatic"),
    manual: t("social.metricsManual"),
  }

  const [connectOpen, setConnectOpen] = useState(false)
  const [challengeOpen, setChallengeOpen] = useState(false)
  const [challenge, setChallenge] = useState(randomChallenge())
  const [igHandle, setIgHandle] = useState("")
  const [challengeAccountId, setChallengeAccountId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<SocialAccount | null>(null)

  function copyChallenge() {
    navigator.clipboard
      ?.writeText(challenge)
      .then(() => {
        setCopied(true)
        toast.success(t("social.toastCopied"))
        setTimeout(() => setCopied(false), 1500)
      })
      .catch(() => {
        toast.error(t("social.toastCopyFailed"), { description: challenge })
      })
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
      ownershipStatus: "verified",
      metricsMode: "automatic",
      connectionStatus: "connected",
      connectedAt: "Just now",
      verifiedAt: "Just now",
      lastChecked: "Just now",
    })
    setConnectOpen(false)
    toast.success(t("social.toastConnected", { platform: platformLabel(platform) }))
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
      ownershipStatus: "pending",
      metricsMode: "manual",
      connectionStatus: "connected",
      connectedAt: "Just now",
    })
    setChallengeAccountId(id)
    setConnectOpen(false)
    setChallengeOpen(true)
    toast.info(t("social.toastChallengeCreated"))
  }

  function verifyChallenge() {
    if (!challengeAccountId) return
    updateSocialAccount(challengeAccountId, { status: "pending" })
    setChallengeOpen(false)
    toast.info(t("social.toastCheckingBio"))
    setTimeout(() => {
      updateSocialAccount(challengeAccountId, { status: "verified" })
      toast.success(t("social.toastIgVerified"))
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
    toast.info(t("social.toastReconnecting", { handle: account.handle }))
    setTimeout(() => {
      updateSocialAccount(account.id, {
        status: "verified",
        connectionStatus: "connected",
        lastChecked: "Just now",
      })
      toast.success(t("social.toastReconnected", { handle: account.handle }))
    }, 1400)
  }

  function confirmRemove() {
    if (!removeTarget) return
    removeSocialAccount(removeTarget.id)
    toast.success(t("social.toastRemoved", { handle: removeTarget.handle }))
    setRemoveTarget(null)
  }

  const pendingChallenge = socialAccounts.some(
    (a) => a.status === "challenge_created" || a.status === "pending",
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("social.title")}
        description={t("social.description")}
      >
        <Dialog open={connectOpen} onOpenChange={setConnectOpen}>
          <Button onClick={() => setConnectOpen(true)}>
            <Plus data-icon="inline-start" />
            {t("social.connect")}
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("social.connectDialogTitle")}</DialogTitle>
              <DialogDescription>{t("social.connectDialogDescription")}</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3">
              <Button variant="outline" className="justify-start" onClick={() => connectOauth("tiktok", "oauth")}>
                <PlatformIcon platform="tiktok" className="size-4" />
                {t("social.connectTiktok")}
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => connectOauth("youtube", "google")}>
                <PlatformIcon platform="youtube" className="size-4" />
                {t("social.connectYoutube")}
              </Button>
              <Separator />
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">{t("social.verifyIgTitle")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("social.verifyIgHint")}
                </p>
                <InputGroup>
                  <InputGroupInput
                    placeholder={t("social.igHandlePlaceholder")}
                    value={igHandle}
                    onChange={(e) => setIgHandle(e.target.value)}
                  />
                  <InputGroupAddon>
                    <PlatformIcon platform="instagram" className="size-4" />
                  </InputGroupAddon>
                </InputGroup>
                <Button variant="secondary" onClick={startIgChallenge}>
                  {t("social.createChallenge")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Alert>
        <ShieldCheck />
        <AlertTitle>{t("social.whyTitle")}</AlertTitle>
        <AlertDescription>
          {t("social.whyBody")}
        </AlertDescription>
      </Alert>

      {socialAccounts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <ShieldCheck className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium">{t("social.noneTitle")}</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              {t("social.noneBody")}
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
                      <CardDescription>{formatNumber(account.followers)} {t("social.followers")}</CardDescription>
                    </div>
                  </div>
                  <VerificationStatusBadge status={account.status} />
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {account.connectionStatus === "connection_required" && (
                  <Alert variant="destructive">
                    <AlertTriangle />
                    <AlertTitle>{t("social.reconnectNeededTitle")}</AlertTitle>
                    <AlertDescription>
                      {t("social.reconnectNeededBody")}
                    </AlertDescription>
                  </Alert>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("social.method")}</span>
                  <Badge variant="secondary">{methodLabels[account.method]}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("social.metrics")}</span>
                  <span className="flex items-center gap-1.5">
                    {account.metricsMode === "automatic" ? (
                      <Zap className="size-3.5 text-muted-foreground" />
                    ) : (
                      <Eye className="size-3.5 text-muted-foreground" />
                    )}
                    {metricsModeLabels[account.metricsMode]}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("social.connected")}</span>
                  <span>{account.connectedAt}</span>
                </div>
                {account.status === "challenge_created" && (
                  <Button size="sm" variant="secondary" onClick={() => reconnect(account)}>
                    <CheckCircle2 data-icon="inline-start" />
                    {t("social.completeVerification")}
                  </Button>
                )}
                <Separator />
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => reconnect(account)}>
                    <RefreshCw data-icon="inline-start" />
                    {t("social.reconnect")}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setRemoveTarget(account)}
                    aria-label={t("social.removeAria", { handle: account.handle })}
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
          <AlertTitle>{t("social.challengePendingTitle")}</AlertTitle>
          <AlertDescription>
            {t("social.challengePendingBody")}
          </AlertDescription>
        </Alert>
      )}

      {/* Bio challenge dialog */}
      <Dialog open={challengeOpen} onOpenChange={setChallengeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("social.challengeDialogTitle")}</DialogTitle>
            <DialogDescription>
              {t("social.challengeDialogDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <InputGroup>
              <InputGroupInput readOnly value={challenge} />
              <InputGroupAddon align="inline-end">
                <InputGroupButton onClick={copyChallenge}>
                  <Copy data-icon="inline-start" />
                  {copied ? t("social.copied") : t("social.copy")}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            <p className="text-xs text-muted-foreground">
              {t("social.challengeTip")}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChallengeOpen(false)}>
              {t("social.later")}
            </Button>
            <Button onClick={verifyChallenge}>
              <CheckCircle2 data-icon="inline-start" />
              {t("social.addedVerify")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove confirmation */}
      <Dialog open={!!removeTarget} onOpenChange={(open) => !open && setRemoveTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("social.removeTitle", { handle: removeTarget?.handle ?? "" })}</DialogTitle>
            <DialogDescription>
              {t("social.removeBody")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveTarget(null)}>
              {t("social.cancel")}
            </Button>
            <Button variant="destructive" onClick={confirmRemove}>
              <Trash2 data-icon="inline-start" />
              {t("social.removeAccount")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
