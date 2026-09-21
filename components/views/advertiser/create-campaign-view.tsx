"use client"

import { useState } from "react"
import { Check, Rocket, AlertTriangle, Plus, LinkIcon, Info } from "lucide-react"
import { toast } from "sonner"

import { useApp } from "@/components/app/app-provider"
import { useT } from "@/components/i18n/locale-provider"
import { formatCurrency } from "@/lib/format"
import { getErrorMessage } from "@/lib/errors"
import { DEFAULT_PLATFORM_FEE_PERCENT } from "@/lib/config"
import { calculateCampaignReserve, calculatePlatformFee } from "@/lib/domain/money"
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

const platformOptions: { value: Platform; label: string; descKey: string }[] = [
  { value: "tiktok", label: "TikTok", descKey: "createCampaign.platformTiktokDesc" },
  { value: "instagram", label: "Instagram Reels", descKey: "createCampaign.platformInstagramDesc" },
  { value: "youtube", label: "YouTube Shorts", descKey: "createCampaign.platformYoutubeDesc" },
]

const categoryOptions: { value: CampaignCategory; labelKey: string }[] = [
  { value: "clipping", labelKey: "createCampaign.catClipping" },
  { value: "logo", labelKey: "createCampaign.catLogo" },
  { value: "video_banner", labelKey: "createCampaign.catVideoBanner" },
  { value: "music", labelKey: "createCampaign.catMusic" },
]

const languageOptions: { value: VideoLanguage; labelKey: string }[] = [
  { value: "any", labelKey: "createCampaign.langAny" },
  { value: "en", labelKey: "createCampaign.langEn" },
  { value: "ru", labelKey: "createCampaign.langRu" },
  { value: "uk", labelKey: "createCampaign.langUk" },
]

const FEE_PERCENT = DEFAULT_PLATFORM_FEE_PERCENT

export function CreateCampaignView() {
  const { navigate, advertiserWallet, createCampaign } = useApp()
  const t = useT()

  // Basics
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState<CampaignCategory>("clipping")
  const [description, setDescription] = useState("")

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
  const [maxPerVideo, setMaxPerVideo] = useState("200")
  const [maxPerAccount, setMaxPerAccount] = useState("250")

  const [submitting, setSubmitting] = useState(false)
  const [depositOpen, setDepositOpen] = useState(false)

  const budgetNum = Number(budget) || 0
  const rateNum = Number(rate) || 0
  const budgetMinor = Math.round(budgetNum * 100)
  const rateMinor = Math.round(rateNum * 100)
  const feeMinor = calculatePlatformFee(budgetMinor, FEE_PERCENT)
  const totalReserveMinor = calculateCampaignReserve(budgetMinor, FEE_PERCENT)
  const estimatedViews = rateNum > 0 ? (budgetNum / rateNum) * 1_000_000 : 0

  const insufficient = totalReserveMinor > advertiserWallet.availableMinor
  const shortfall = Math.max(0, totalReserveMinor - advertiserWallet.availableMinor)
  const noPlatform = selected.length === 0
  const audienceInvalid = specificAudience && audienceDescription.trim().length === 0
  const canLaunch = !insufficient && !noPlatform && !audienceInvalid && budgetNum > 0

  function togglePlatform(p: Platform) {
    setSelected((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]))
  }

  function buildInput() {
    const name = title.trim() || t("createCampaign.untitledCampaign")
    return {
      title: name,
      brand: name,
      category,
      description: description.trim(),
      instructions: [],
      platforms: selected,
      requirements: {
        minVideoDurationSeconds: Number(minDuration) || 0,
        maxVideoDurationSeconds: 0,
        minViews: Number(minViews) || 0,
        minFollowers: Number(minFollowers) || 0,
        videoLanguage: language,
        specificAudience,
        audienceDescription: specificAudience ? audienceDescription.trim() : undefined,
        requiredHashtag: normalizedHashtag || undefined,
      },
      promoMaterialsUrl: promoUrl.trim() || undefined,
      creatorBudgetMinor: budgetMinor,
      ratePerMillionMinor: rateMinor,
      maxPayoutPerVideoMinor: Math.round((Number(maxPerVideo) || 0) * 100),
      maxPayoutPerAccountMinor: Math.round((Number(maxPerAccount) || 0) * 100),
      maxSubmissionsPerAccount: 3,
      platformFeePercent: FEE_PERCENT,
    }
  }

  async function launch() {
    if (!canLaunch || submitting) return
    setSubmitting(true)
    try {
      await createCampaign(buildInput(), { launch: true })
      toast.success(t("createCampaign.createdToast"), {
        description: t("createCampaign.createdToastDesc", {
          amount: formatCurrency(totalReserveMinor),
          fee: formatCurrency(feeMinor),
        }),
      })
      navigate("campaigns")
    } catch (e) {
      toast.error(getErrorMessage(e))
    } finally {
      setSubmitting(false)
    }
  }

  async function saveAsDraft() {
    if (noPlatform || audienceInvalid || budgetNum <= 0 || submitting) return
    setSubmitting(true)
    try {
      await createCampaign(buildInput(), { launch: false })
      toast.success(t("createCampaign.draftSavedToast"), {
        description: t("createCampaign.draftSavedToastDesc"),
      })
      navigate("campaigns")
    } catch (e) {
      toast.error(getErrorMessage(e))
    } finally {
      setSubmitting(false)
    }
  }

  const normalizedHashtag = requiredHashtag.trim()
    ? requiredHashtag.trim().startsWith("#")
      ? requiredHashtag.trim()
      : `#${requiredHashtag.trim()}`
    : ""

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("createCampaign.title")}
        description={t("createCampaign.description")}
        backLabel={t("createCampaign.backToCampaigns")}
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
                  <CardTitle>{t("createCampaign.basics")}</CardTitle>
                  <CardDescription>{t("createCampaign.basicsDesc")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-5">
                <Field>
                  <FieldLabel htmlFor="title">{t("createCampaign.campaignTitleLabel")}</FieldLabel>
                  <Input
                    id="title"
                    placeholder={t("createCampaign.campaignTitlePlaceholder")}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="category">{t("createCampaign.categoryLabel")}</FieldLabel>
                  <Select value={category} onValueChange={(v) => setCategory(v as CampaignCategory)}>
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {categoryOptions.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {t(c.labelKey)}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="desc">{t("createCampaign.descriptionLabel")}</FieldLabel>
                  <Textarea
                    id="desc"
                    rows={4}
                    placeholder={t("createCampaign.descriptionPlaceholder")}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <FieldDescription>{t("createCampaign.descriptionHelp")}</FieldDescription>
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
                  <CardTitle>{t("createCampaign.platforms")}</CardTitle>
                  <CardDescription>{t("createCampaign.platformsDesc")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <FieldSet>
                <FieldLegend className="sr-only">{t("createCampaign.platforms")}</FieldLegend>
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
                          <span className="text-xs text-muted-foreground">{t(p.descKey)}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
                {noPlatform && <p className="mt-3 text-sm text-destructive">{t("createCampaign.selectAtLeastOne")}</p>}
              </FieldSet>
            </CardContent>
          </Card>

          {/* 3. Requirements */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <StepBadge n={3} />
                <div className="flex flex-col">
                  <CardTitle>{t("createCampaign.requirements")}</CardTitle>
                  <CardDescription>{t("createCampaign.requirementsDesc")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-5">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field>
                    <FieldLabel htmlFor="minDuration">{t("createCampaign.minDuration")}</FieldLabel>
                    <Input
                      id="minDuration"
                      type="number"
                      min={0}
                      value={minDuration}
                      onChange={(e) => setMinDuration(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="minViews">{t("createCampaign.minViews")}</FieldLabel>
                    <Input
                      id="minViews"
                      type="number"
                      min={0}
                      value={minViews}
                      onChange={(e) => setMinViews(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="minFollowers">{t("createCampaign.minFollowers")}</FieldLabel>
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
                    <FieldLabel htmlFor="language">{t("createCampaign.videoLanguage")}</FieldLabel>
                    <Select value={language} onValueChange={(v) => setLanguage(v as VideoLanguage)}>
                      <SelectTrigger id="language">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {languageOptions.map((l) => (
                            <SelectItem key={l.value} value={l.value}>
                              {t(l.labelKey)}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="hashtag">{t("createCampaign.requiredHashtag")}</FieldLabel>
                    <Input
                      id="hashtag"
                      placeholder={t("createCampaign.hashtagPlaceholder")}
                      value={requiredHashtag}
                      onChange={(e) => setRequiredHashtag(e.target.value)}
                    />
                    <FieldDescription>
                      {normalizedHashtag ? t("createCampaign.hashtagMust", { hashtag: normalizedHashtag }) : t("createCampaign.optional")}
                    </FieldDescription>
                  </Field>
                </div>
                <Separator />
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{t("createCampaign.targetAudience")}</span>
                    <span className="text-xs text-muted-foreground">
                      {t("createCampaign.targetAudienceDesc")}
                    </span>
                  </div>
                  <Switch checked={specificAudience} onCheckedChange={setSpecificAudience} />
                </div>
                {specificAudience && (
                  <Field>
                    <FieldLabel htmlFor="audience">{t("createCampaign.audienceDescription")}</FieldLabel>
                    <Textarea
                      id="audience"
                      rows={3}
                      placeholder={t("createCampaign.audiencePlaceholder")}
                      value={audienceDescription}
                      onChange={(e) => setAudienceDescription(e.target.value)}
                    />
                    {audienceInvalid && (
                      <p className="text-sm text-destructive">{t("createCampaign.audienceInvalid")}</p>
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
                  <CardTitle>{t("createCampaign.promoMaterials")}</CardTitle>
                  <CardDescription>{t("createCampaign.promoMaterialsDesc")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Field>
                    <FieldLabel htmlFor="promo">{t("createCampaign.materialsLink")}</FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <LinkIcon className="size-4" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="promo"
                    placeholder={t("createCampaign.materialsPlaceholder")}
                    value={promoUrl}
                    onChange={(e) => setPromoUrl(e.target.value)}
                  />
                </InputGroup>
                <FieldDescription>
                  {t("createCampaign.materialsHelp")}
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
                  <CardTitle>{t("createCampaign.budgetPayout")}</CardTitle>
                  <CardDescription>{t("createCampaign.budgetPayoutDesc")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="budget">{t("createCampaign.totalBudget")}</FieldLabel>
                    <Input id="budget" type="number" value={budget} onChange={(e) => setBudget(e.target.value)} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="rate">{t("createCampaign.ratePerMillion")}</FieldLabel>
                    <Input id="rate" type="number" value={rate} onChange={(e) => setRate(e.target.value)} />
                  </Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="maxvid">{t("createCampaign.maxPayoutVideo")}</FieldLabel>
                    <Input
                      id="maxvid"
                      type="number"
                      value={maxPerVideo}
                      onChange={(e) => setMaxPerVideo(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="maxacc">{t("createCampaign.maxPayoutAccount")}</FieldLabel>
                    <Input
                      id="maxacc"
                      type="number"
                      value={maxPerAccount}
                      onChange={(e) => setMaxPerAccount(e.target.value)}
                    />
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
                  <CardTitle>{t("createCampaign.reviewLaunch")}</CardTitle>
                  <CardDescription>{t("createCampaign.reviewLaunchDesc")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">{t("createCampaign.estimatedViews")}</span>
                <span className="text-2xl font-semibold text-primary tabular-nums">
                  {estimatedViews >= 1_000_000
                    ? `${(estimatedViews / 1_000_000).toFixed(1)}M`
                    : `${Math.round(estimatedViews / 1000)}K`}
                </span>
              </div>
              <Separator />
              <div className="flex items-start justify-between gap-3 text-sm">
                <span className="text-muted-foreground">{t("createCampaign.summaryPlatforms")}</span>
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
                  <span className="text-destructive">{t("createCampaign.noneSelected")}</span>
                )}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t("createCampaign.summaryRate")}</span>
                <span className="font-medium">{t("createCampaign.ratePerMillionShort", { amount: formatCurrency(rateMinor) })}</span>
              </div>
              <Separator />
              {/* Fee / reserve breakdown */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t("createCampaign.campaignBudget")}</span>
                <span className="font-medium tabular-nums">{formatCurrency(budgetMinor)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1 text-muted-foreground">
                  {t("createCampaign.platformFee", { percent: String(FEE_PERCENT) })}
                  <Info className="size-3" />
                </span>
                <span className="font-medium tabular-nums">{formatCurrency(feeMinor)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{t("createCampaign.totalToReserve")}</span>
                <span className="font-semibold tabular-nums">{formatCurrency(totalReserveMinor)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("createCampaign.feeNote", { percent: String(FEE_PERCENT) })}
              </p>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t("createCampaign.walletAvailable")}</span>
                <span className={`font-medium tabular-nums ${insufficient ? "text-destructive" : ""}`}>
                  {formatCurrency(advertiserWallet.availableMinor)}
                </span>
              </div>
              {insufficient && (
                <Alert variant="destructive">
                  <AlertTriangle className="size-4" />
                  <AlertTitle>{t("createCampaign.insufficientBalance")}</AlertTitle>
                  <AlertDescription>
                    {t("createCampaign.insufficientDesc", { amount: formatCurrency(shortfall) })}
                  </AlertDescription>
                </Alert>
              )}
              {insufficient ? (
                <Button size="lg" variant="secondary" onClick={() => setDepositOpen(true)}>
                  <Plus data-icon="inline-start" />
                  {t("createCampaign.addAmount", { amount: formatCurrency(shortfall) })}
                </Button>
              ) : (
                <Button size="lg" onClick={launch} disabled={!canLaunch || submitting}>
                  <Rocket data-icon="inline-start" />
                  {t("createCampaign.launchCampaign")}
                </Button>
              )}
              <Button
                size="lg"
                variant="outline"
                onClick={saveAsDraft}
                disabled={noPlatform || audienceInvalid || budgetNum <= 0 || submitting}
              >
                {t("createCampaign.saveAsDraft")}
              </Button>
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
