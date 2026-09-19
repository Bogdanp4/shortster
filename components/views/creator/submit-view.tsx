"use client"

import { useState } from "react"
import { Link2, Upload, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

import { useApp } from "@/components/app/app-provider"
import { getCampaign, creatorSocialAccounts } from "@/lib/mock-data"
import { formatCurrency, formatNumber } from "@/lib/format"
import { PageHeader } from "@/components/shared/page-header"
import { PlatformIcon } from "@/components/shared/platform-icon"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"

export function SubmitView() {
  const { selectedCampaignId, navigate } = useApp()
  const campaign = getCampaign(selectedCampaignId ?? "stake-highlights") ?? getCampaign("stake-highlights")!
  const [account, setAccount] = useState(creatorSocialAccounts[0].id)
  const [url, setUrl] = useState("")

  const eligibleAccounts = creatorSocialAccounts.filter((a) => campaign.platforms.includes(a.platform))

  function submit() {
    if (!url.trim()) {
      toast.error("Add your video URL", { description: "Paste the public link to the video you posted." })
      return
    }
    toast.success("Submission received", {
      description: `${campaign.title} — we'll verify views and notify you once reviewed.`,
    })
    navigate("submissions")
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Submit a video"
        description={`Submitting to ${campaign.title} by ${campaign.brand}`}
        backLabel="Back to campaign"
        onBack={() => navigate("campaign", { campaignId: campaign.id })}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Video details</CardTitle>
              <CardDescription>Paste the link to your already-posted video. We verify views automatically.</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="account">Posting account</FieldLabel>
                  <Select value={account} onValueChange={setAccount}>
                    <SelectTrigger id="account">
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {eligibleAccounts.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.handle} · {formatNumber(a.followers)} followers
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldDescription>Only verified accounts on eligible platforms are shown.</FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="url">Video URL</FieldLabel>
                  <Input
                    id="url"
                    placeholder="https://tiktok.com/@you/video/..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                  <FieldDescription>Must be a public post that uses the campaign requirements.</FieldDescription>
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Before you submit</CardTitle>
              <CardDescription>Confirm your video meets every requirement to avoid rejection.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {campaign.requirements.map((r) => (
                <div key={r} className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="size-4 text-primary" />
                  <span className="text-muted-foreground">{r}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Payout estimate</CardTitle>
              <CardDescription>Based on this campaign's rate</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Rate</span>
                <span className="font-medium">{formatCurrency(campaign.ratePerMillion)} / 1M views</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Min. views to earn</span>
                <span className="font-medium">{formatNumber(campaign.minViews)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Max per video</span>
                <span className="font-medium">{formatCurrency(campaign.maxPayoutPerVideo)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Example at 500K views</span>
                <span className="text-lg font-semibold text-primary">
                  {formatCurrency((500000 / 1_000_000) * campaign.ratePerMillion)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <Link2 />
            <AlertTitle>Views are verified</AlertTitle>
            <AlertDescription>
              We pull view counts directly from the platform. Fake or purchased views are flagged and rejected.
            </AlertDescription>
          </Alert>

          <Button size="lg" onClick={submit}>
            <Upload data-icon="inline-start" />
            Submit for review
          </Button>
        </div>
      </div>
    </div>
  )
}
