"use client"

import { useState } from "react"
import { Plus, Copy, ShieldCheck, Info } from "lucide-react"
import { toast } from "sonner"

import { creatorSocialAccounts } from "@/lib/mock-data"
import { formatNumber } from "@/lib/format"
import { PageHeader } from "@/components/shared/page-header"
import { PlatformIcon } from "@/components/shared/platform-icon"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { InputGroup, InputGroupInput, InputGroupAddon, InputGroupButton } from "@/components/ui/input-group"

const methodLabels: Record<string, string> = {
  oauth: "OAuth",
  google: "Google Sign-in",
  bio_challenge: "Bio challenge",
}

export function SocialAccountsView() {
  const challenge = "shortster-K7F4M2"
  const [copied, setCopied] = useState(false)

  function copyChallenge() {
    navigator.clipboard?.writeText(challenge)
    setCopied(true)
    toast.success("Challenge code copied")
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Social Accounts"
        description="Connect and verify the accounts you post from. Only verified accounts can submit videos."
      >
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus data-icon="inline-start" />
              Connect account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Connect a social account</DialogTitle>
              <DialogDescription>Choose how you want to verify ownership of this account.</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3">
              <Button variant="outline" className="justify-start" onClick={() => toast.info("Redirecting to TikTok OAuth…")}>
                <PlatformIcon platform="tiktok" className="size-4" />
                Connect TikTok with OAuth
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => toast.info("Redirecting to Google…")}>
                <PlatformIcon platform="youtube" className="size-4" />
                Connect YouTube with Google
              </Button>
              <Separator />
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">Verify Instagram with a bio challenge</p>
                <p className="text-xs text-muted-foreground">
                  Add this code to your Instagram bio, then we&apos;ll verify it automatically.
                </p>
                <InputGroup>
                  <InputGroupInput readOnly value={challenge} />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton onClick={copyChallenge}>
                      <Copy data-icon="inline-start" />
                      {copied ? "Copied" : "Copy"}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {creatorSocialAccounts.map((account) => (
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
            </CardContent>
          </Card>
        ))}
      </div>

      <Alert>
        <Info />
        <AlertTitle>Bio challenge pending</AlertTitle>
        <AlertDescription>
          A verification can take up to 30 minutes after you update your bio. We&apos;ll notify you when it completes.
        </AlertDescription>
      </Alert>
    </div>
  )
}
