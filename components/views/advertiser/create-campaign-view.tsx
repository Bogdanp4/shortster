"use client"

import { useState } from "react"
import { Check, Rocket, AlertTriangle, Plus, LinkIcon, Info } from "lucide-react"
import { toast } from "sonner"

import { useApp } from "@/components/app/app-provider"
import { formatCurrency } from "@/lib/format"
import type { Platform, CampaignCategory, VideoLanguage } from "@/lib/types"
import { PageHeader } from "@/components/shared/page-header"
import { PlatformIcon, platformLabel } from "@/components/shared/platform-icon"
import { DepositDialog } from "@/components/advertiser/deposit-dialog"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldLabel, FieldDescription, FieldSet, FieldLegend } from "@/components/ui/field"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/ui/input-group"
import { cn } from "@/lib/utils"

const platformOptions: { value: Platform; label: string; description: string }[] = [
  { value: "tiktok", label: "TikTok", description: "TikTok short-form videos" },
  { value: "instagram", label: "Instagram Reels", description: "Instagram Reels" },
  { value: "youtube", label: "YouTube Shorts", description: "YouTube Shorts" },
]

const categoryOptions: { value: CampaignCategory; label: string }[] = [
  { value: "clipping", label: "Clipping" },
  { value: "logo", label: "Logo" },
  { value: "video_banner", label: "Video Banner" },
  { value: "music", label: "Music" },
]

const languageOptions: { value: VideoLanguage; label: string }[] = [
  { value: "any", label: "Any language" },
  { value: "en", label: "English" },
  { value: "ru", label: "Russian" },
  { value: "uk", label: "Ukrainian" },
]

const FEE_PERCENT = 10

export function CreateCampaignView() {
  const { navigate, advertiserWallet, reserveForCampaign } = useApp()

  // Basics
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState<CampaignCategory>("clipping")

  // Platforms
  const [selected, setSelected] = useState<Platform[]>(["tiktok", "instagram", "youtube"])

  // Requirements
  const [minDuration, setMinDuration] = useState("15")
  const [minViews, setMinViews] = useState("10000")
  const [minFollowers, setMinFollowers] = useState("1000")
  const [language, setLanguage] = useState<VideoLanguage>("any")
  const [requiredHashtag, setRequiredHashtag] = useState("")
  const [specificAudience, setSpecificAudience] = useState(false)
  const [audienceDescription, setAudienceDescription] = useState("")

  // Promo materials
  const [promoUrl, setPromoUrl] = useState("")

  // Budget
  const [budget, setBudget] = useState("10000")
  const [rate, setRate] = useState("500")

  const [depositOpen, setDepositOpen] = useState(false)

  const budgetNum = Number(budget) || 0
  const rateNum = Number(rate) || 0
  const fee = Math.round(budgetNum * (FEE_PERCENT / 100) * 100) / 100
  const totalReserve = budgetNum + fee
  const estimatedViews = rateNum > 0 ? (budgetNum / rateNum) * 1_000_000 : 0

  const insufficient = totalReserve > advertiserWallet.available
  const shortfall = Math.max(0, totalReserve - advertiserWallet.available)
  const noPlatform = selected.length === 0
  const audienceInvalid = specificAudience && audienceDescription.trim().length === 0
  const canLaunch = !insufficient && !noPlatform && !audienceInvalid && budgetNum > 0

  function togglePlatform(p: Platform) {
    setSelected((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]))
  }

  function launch() {
    if (!canLaunch) return
    const name = title.trim() || "Untitled campaign"
    reserveForCampaign(totalReserve, name)
    toast.success("Campaign created", {
      description: `${formatCurrency(totalReserve)} reserved (incl. ${formatCurrency(fee)} platform fee). Your campaign is now live and discoverable by creators.`,
    })
    navigate("campaigns")
  }

  const normalizedHashtag = requiredHashtag.trim()
    ? requiredHashtag.trim().startsWith("#")
      ? requiredHashtag.trim()
      : `#${requiredHashtag.trim()}`
    : ""

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Create Campaign"
        description="Set up a new campaign for creators to clip and promote."
        backLabel="Back to campaigns"
        onBack={() => navigate("campaigns")}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* 1. Basics */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <StepBadge n={1} />
                <div className="flex flex-col">
                  <CardTitle>Basics</CardTitle>
                  <CardDescription>Name, category and brief</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-5">
                <Field>
                  <FieldLabel htmlFor="title">Campaign title</FieldLabel>
                  <Input
                    id="title"
                    placeholder="e.g. Summer Highlights"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="category">Category</FieldLabel>
                  <Select value={category} onValueChange={(v) => setCategory(v as CampaignCategory)}>
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {categoryOptions.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="desc">Description</FieldLabel>
                  <Textarea id="desc" rows={4} placeholder="What should creators make?" />
                  <FieldDescription>Explain the vibe, footage sources and any brand rules.</FieldDescription>
                </Field>
              </div>
            </CardContent>
          </Card>

          {/* 2. Platforms */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <StepBadge n={2} />
                <div className="flex flex-col">
                  <CardTitle>Platforms</CardTitle>
                  <CardDescription>Where creators can publish content for this campaign</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <FieldSet>
                <FieldLegend className="sr-only">Platforms</FieldLegend>
                <div className="grid gap-3 sm:grid-cols-3">
                  {platformOptions.map((p) => {
                    const active = selected.includes(p.value)
                    return (
                      <button
                        key={p.value}
                        type="button"
                        role="checkbox"
                        aria-checked={active}
                        onClick={() => togglePlatform(p.value)}
                        className={cn(
                          "relative flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-colors",
                          active
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-border hover:border-primary/40 hover:bg-muted/40",
                        )}
                      >
                        <span
                          className={cn(
                            "absolute right-3 top-3 flex size-5 items-center justify-center rounded-full border transition-colors",
                            active ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40",
                          )}
                        >
                          {active && <Check className="size-3" />}
                        </span>
                        <PlatformIcon platform={p.value} className="size-6" />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{p.label}</span>
                          <span className="text-xs text-muted-foreground">{p.description}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
                {noPlatform && <p className="mt-3 text-sm text-destructive">Select at least one platform.</p>}
              </FieldSet>
            </CardContent>
          </Card>

          {/* 3. Requirements */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <StepBadge n={3} />
                <div className="flex flex-col">
                  <CardTitle>Requirements</CardTitle>
                  <CardDescription>Rules moderators check on every submission</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-5">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field>
                    <FieldLabel htmlFor="minDuration">Min duration (sec)</FieldLabel>
                    <Input
                      id="minDuration"
                      type="number"
                      min={0}
                      value={minDuration}
                      onChange={(e) => setMinDuration(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="minViews">Min views</FieldLabel>
                    <Input
                      id="minViews"
                      type="number"
                      min={0}
                      value={minViews}
                      onChange={(e) => setMinViews(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="minFollowers">Min followers</FieldLabel>
                    <Input
                      id="minFollowers"
                      type="number"
                      min={0}
                      value={minFollowers}
                      onChange={(e) => setMinFollowers(e.target.value)}
                    />
                  </Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="language">Video language</FieldLabel>
                    <Select value={language} onValueChange={(v) => setLanguage(v as VideoLanguage)}>
                      <SelectTrigger id="language">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {languageOptions.map((l) => (
                            <SelectItem key={l.value} value={l.value}>
                              {l.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="hashtag">Required hashtag</FieldLabel>
                    <Input
                      id="hashtag"
                      placeholder="#brandname"
                      value={requiredHashtag}
                      onChange={(e) => setRequiredHashtag(e.target.value)}
                    />
                    <FieldDescription>
                      {normalizedHashtag ? `Creators must include ${normalizedHashtag}` : "Optional"}
                    </FieldDescription>
                  </Field>
                </div>
                <Separator />
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">Target a specific audience</span>
                    <span className="text-xs text-muted-foreground">
                      Require creators to tailor content to a defined audience.
                    </span>
                  </div>
                  <Switch checked={specificAudience} onCheckedChange={setSpecificAudience} />
                </div>
                {specificAudience && (
                  <Field>
                    <FieldLabel htmlFor="audience">Audience description</FieldLabel>
                    <Textarea
                      id="audience"
                      rows={3}
                      placeholder="e.g. Gen-Z gamers in the US who follow FPS titles"
                      value={audienceDescription}
                      onChange={(e) => setAudienceDescription(e.target.value)}
                    />
                    {audienceInvalid && (
                      <p className="text-sm text-destructive">Describe the audience or turn this off.</p>
                    )}
                  </Field>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 4. Promo materials */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <StepBadge n={4} />
                <div className="flex flex-col">
                  <CardTitle>Promo materials</CardTitle>
                  <CardDescription>Footage, logos and brand assets for creators</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Field>
                <FieldLabel htmlFor="promo">Materials link</FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <LinkIcon className="size-4" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="promo"
                    placeholder="https://drive.google.com/…"
                    value={promoUrl}
                    onChange={(e) => setPromoUrl(e.target.value)}
                  />
                </InputGroup>
                <FieldDescription>
                  Paste a Google Drive, Dropbox or direct URL. Creators can download source footage and brand kits.
                </FieldDescription>
              </Field>
            </CardContent>
          </Card>

          {/* 5. Budget & payout */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <StepBadge n={5} />
                <div className="flex flex-col">
                  <CardTitle>Budget & payout</CardTitle>
                  <CardDescription>Total budget and rate per million views</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="budget">Total budget ($)</FieldLabel>
                    <Input id="budget" type="number" value={budget} onChange={(e) => setBudget(e.target.value)} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="rate">Rate per 1M views ($)</FieldLabel>
                    <Input id="rate" type="number" value={rate} onChange={(e) => setRate(e.target.value)} />
                  </Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="maxvid">Max payout / video ($)</FieldLabel>
                    <Input id="maxvid" type="number" defaultValue="200" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="maxacc">Max payout / account ($)</FieldLabel>
                    <Input id="maxacc" type="number" defaultValue="250" />
                  </Field>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 6. Summary & launch */}
        <div className="flex flex-col gap-6">
          <Card className="lg:sticky lg:top-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <StepBadge n={6} />
                <div className="flex flex-col">
                  <CardTitle>Review & launch</CardTitle>
                  <CardDescription>Reserve budget to go live</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">Estimated views</span>
                <span className="text-2xl font-semibold text-primary tabular-nums">
                  {estimatedViews >= 1_000_000
                    ? `${(estimatedViews / 1_000_000).toFixed(1)}M`
                    : `${Math.round(estimatedViews / 1000)}K`}
                </span>
              </div>
              <Separator />
              <div className="flex items-start justify-between gap-3 text-sm">
                <span className="text-muted-foreground">Platforms</span>
                {selected.length > 0 ? (
                  <div className="flex flex-wrap justify-end gap-1.5">
                    {selected.map((p) => (
                      <span key={p} className="flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-xs">
                        <PlatformIcon platform={p} className="size-3" />
                        {platformLabel(p)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-destructive">None selected</span>
                )}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Rate</span>
                <span className="font-medium">{formatCurrency(rateNum)} / 1M</span>
              </div>
              <Separator />
              {/* Fee / reserve breakdown */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Campaign budget</span>
                <span className="font-medium tabular-nums">{formatCurrency(budgetNum)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1 text-muted-foreground">
                  Platform fee ({FEE_PERCENT}%)
                  <Info className="size-3" />
                </span>
                <span className="font-medium tabular-nums">{formatCurrency(fee)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Total to reserve</span>
                <span className="font-semibold tabular-nums">{formatCurrency(totalReserve)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                The {FEE_PERCENT}% fee is paid by you — creators always receive 100% of their earned rate.
              </p>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Wallet available</span>
                <span className={`font-medium tabular-nums ${insufficient ? "text-destructive" : ""}`}>
                  {formatCurrency(advertiserWallet.available)}
                </span>
              </div>
              {insufficient && (
                <Alert variant="destructive">
                  <AlertTriangle className="size-4" />
                  <AlertTitle>Insufficient balance</AlertTitle>
                  <AlertDescription>
                    You need {formatCurrency(shortfall)} more to reserve this budget. Add funds to launch.
                  </AlertDescription>
                </Alert>
              )}
              {insufficient ? (
                <Button size="lg" variant="secondary" onClick={() => setDepositOpen(true)}>
                  <Plus data-icon="inline-start" />
                  Add {formatCurrency(shortfall)}
                </Button>
              ) : (
                <Button size="lg" onClick={launch} disabled={!canLaunch}>
                  <Rocket data-icon="inline-start" />
                  Launch campaign
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <DepositDialog open={depositOpen} onOpenChange={setDepositOpen} />
    </div>
  )
}

function StepBadge({ n }: { n: number }) {
  return (
    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
      {n}
    </span>
  )
}
