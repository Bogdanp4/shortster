"use client"

import { useState } from "react"
import { Check, Rocket, AlertTriangle, Plus } from "lucide-react"
import { toast } from "sonner"

import { useApp } from "@/components/app/app-provider"
import { formatCurrency } from "@/lib/format"
import type { Platform } from "@/lib/types"
import { PageHeader } from "@/components/shared/page-header"
import { PlatformIcon } from "@/components/shared/platform-icon"
import { DepositDialog } from "@/components/advertiser/deposit-dialog"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldGroup, FieldLabel, FieldDescription, FieldSet, FieldLegend } from "@/components/ui/field"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const platforms: { value: Platform; label: string }[] = [
  { value: "tiktok", label: "TikTok" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
]

export function CreateCampaignView() {
  const { navigate, advertiserWallet, reserveForCampaign } = useApp()
  const [selected, setSelected] = useState<string[]>(["tiktok", "instagram"])
  const [budget, setBudget] = useState("10000")
  const [rate, setRate] = useState("500")
  const [title, setTitle] = useState("")
  const [depositOpen, setDepositOpen] = useState(false)

  const budgetNum = Number(budget) || 0
  const rateNum = Number(rate) || 0
  const estimatedViews = rateNum > 0 ? (budgetNum / rateNum) * 1_000_000 : 0
  const insufficient = budgetNum > advertiserWallet.available
  const shortfall = Math.max(0, budgetNum - advertiserWallet.available)

  function launch() {
    if (insufficient) return
    const name = title.trim() || "Untitled campaign"
    reserveForCampaign(budgetNum, name)
    toast.success("Campaign created", {
      description: `${formatCurrency(budgetNum)} reserved. Your campaign is now live and discoverable by creators.`,
    })
    navigate("campaigns")
  }

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
          <Card>
            <CardHeader>
              <CardTitle>Basics</CardTitle>
              <CardDescription>Name and describe your campaign</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
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
                  <Select defaultValue="clipping">
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="clipping">Clipping</SelectItem>
                        <SelectItem value="gaming">Gaming</SelectItem>
                        <SelectItem value="music">Music</SelectItem>
                        <SelectItem value="ugc">UGC</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="desc">Description</FieldLabel>
                  <Textarea id="desc" rows={4} placeholder="What should creators make?" />
                  <FieldDescription>Explain the vibe, footage sources and any brand rules.</FieldDescription>
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Targeting</CardTitle>
              <CardDescription>Where creators can post</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldSet>
                <FieldLegend>Platforms</FieldLegend>
                <ToggleGroup
                  type="multiple"
                  variant="outline"
                  value={selected}
                  onValueChange={(v) => v.length && setSelected(v)}
                  className="justify-start"
                >
                  {platforms.map((p) => (
                    <ToggleGroupItem key={p.value} value={p.value} className="gap-2">
                      <PlatformIcon platform={p.value} className="size-4" />
                      {p.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </FieldSet>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Budget & payout</CardTitle>
              <CardDescription>Set your total budget and rate per million views</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
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
              </FieldGroup>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card className="lg:sticky lg:top-6">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
              <CardDescription>Estimated reach for your budget</CardDescription>
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
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Budget</span>
                <span className="font-medium">{formatCurrency(budgetNum)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Rate</span>
                <span className="font-medium">{formatCurrency(rateNum)} / 1M</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Platforms</span>
                <div className="flex gap-1.5">
                  {selected.map((p) => (
                    <PlatformIcon key={p} platform={p as Platform} className="size-4" />
                  ))}
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Wallet available</span>
                <span className={`font-medium tabular-nums ${insufficient ? "text-destructive" : ""}`}>
                  {formatCurrency(advertiserWallet.available)}
                </span>
              </div>
              <Separator />
              <div className="flex flex-col gap-2">
                {["Verified views only", "Fraud protection included", "Cancel anytime"].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="size-4 text-primary" />
                    {f}
                  </div>
                ))}
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
                <Button size="lg" onClick={launch}>
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
