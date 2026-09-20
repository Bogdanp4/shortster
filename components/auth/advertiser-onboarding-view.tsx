"use client"

import { useState } from "react"
import { AuthShell } from "./auth-shell"
import { useAuth } from "./auth-provider"
import type { CampaignCategory } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldGroup, FieldDescription } from "@/components/ui/field"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const countries = ["United States", "United Kingdom", "Canada", "Germany", "Philippines", "Brazil", "India"]

const categories: { value: CampaignCategory | "any"; label: string }[] = [
  { value: "any", label: "No preference yet" },
  { value: "clipping", label: "Clipping" },
  { value: "logo", label: "Logo placement" },
  { value: "video_banner", label: "Video banner" },
  { value: "music", label: "Music" },
]

export function AdvertiserOnboardingView() {
  const { completeAdvertiserOnboarding, currentUser } = useAuth()
  const [companyName, setCompanyName] = useState(currentUser?.name ?? "")
  const [website, setWebsite] = useState("")
  const [country, setCountry] = useState("United States")
  const [industry, setIndustry] = useState("")
  const [primaryCategory, setPrimaryCategory] = useState<CampaignCategory | "any">("any")

  const canSubmit = companyName.trim().length > 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    completeAdvertiserOnboarding({
      companyName: companyName.trim(),
      website: website.trim() || undefined,
      country,
      industry: industry.trim() || undefined,
      primaryCategory,
      primaryMarket: "en",
    })
  }

  return (
    <AuthShell
      title="Set up your advertiser profile"
      description="Tell us about your business to launch your first campaign"
      className="max-w-md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="company-name">Company name</FieldLabel>
            <Input id="company-name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="website">Website (optional)</FieldLabel>
              <Input
                id="website"
                placeholder="https://"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="industry">Industry (optional)</FieldLabel>
              <Input
                id="industry"
                placeholder="e.g. iGaming, SaaS"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              />
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="adv-country">Country</FieldLabel>
            <Select value={country} onValueChange={(v) => v && setCountry(v)}>
              <SelectTrigger id="adv-country">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {countries.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel htmlFor="primary-category">Primary campaign type</FieldLabel>
            <Select value={primaryCategory} onValueChange={(v) => v && setPrimaryCategory(v as CampaignCategory | "any")}>
              <SelectTrigger id="primary-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {categories.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>

          <Button type="submit" disabled={!canSubmit} className="w-full">
            Finish Setup
          </Button>
          <FieldDescription className="text-center">
            Add funds from your wallet once you&apos;re in — campaigns need a positive balance to launch.
          </FieldDescription>
        </FieldGroup>
      </form>
    </AuthShell>
  )
}
