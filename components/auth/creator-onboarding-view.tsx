"use client"

import { useState } from "react"
import { toast } from "sonner"
import { AuthShell } from "./auth-shell"
import { useAuth } from "./auth-provider"
import type { Platform } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldGroup, FieldDescription } from "@/components/ui/field"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LinkIcon, CheckCircle2, AlertTriangle } from "lucide-react"

const platforms: { value: Platform; label: string }[] = [
  { value: "tiktok", label: "TikTok" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
]

const countries = ["United States", "United Kingdom", "Canada", "Germany", "Philippines", "Brazil", "India"]

export function CreatorOnboardingView() {
  const { completeCreatorOnboarding, currentUser } = useAuth()
  const [displayName, setDisplayName] = useState(currentUser?.name ?? "")
  const [username, setUsername] = useState("")
  const [country, setCountry] = useState("United States")
  const [platform, setPlatform] = useState<Platform>("tiktok")
  const [handle, setHandle] = useState("")
  const [socialConnected, setSocialConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [touched, setTouched] = useState(false)

  const canSubmit = displayName.trim().length > 0 && username.trim().length > 0 && socialConnected

  function connectSocial() {
    if (!handle.trim()) return
    setConnecting(true)
    setTimeout(() => {
      setConnecting(false)
      setSocialConnected(true)
      toast.success(`Connected ${platform === "tiktok" ? "TikTok" : platform === "instagram" ? "Instagram" : "YouTube"} account`)
    }, 700)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (!canSubmit) return
    completeCreatorOnboarding({
      displayName: displayName.trim(),
      username: username.trim().replace(/^@/, ""),
      country,
      language: "en",
      socialConnected: true,
      socialPlatform: platform,
      socialHandle: handle.trim().startsWith("@") ? handle.trim() : `@${handle.trim()}`,
    })
  }

  return (
    <AuthShell title="Set up your creator profile" description="This is how advertisers will see you" className="max-w-md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <FieldGroup>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="display-name">Display name</FieldLabel>
              <Input id="display-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </Field>
            <Field>
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <Input
                id="username"
                placeholder="alexclips"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="country">Country</FieldLabel>
            <Select value={country} onValueChange={(v) => v && setCountry(v)}>
              <SelectTrigger id="country">
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

          <div className="rounded-lg border border-border/60 p-4">
            <p className="mb-3 text-sm font-medium">Connect a social account</p>
            <p className="mb-3 text-xs text-muted-foreground">
              Required to submit content. This lets us verify view counts automatically.
            </p>
            {socialConnected ? (
              <div className="flex items-center gap-2 rounded-md bg-emerald-500/10 px-3 py-2 text-sm text-emerald-500">
                <CheckCircle2 className="size-4" />
                Connected {handle.trim().startsWith("@") ? handle.trim() : `@${handle.trim()}`} on{" "}
                {platform === "tiktok" ? "TikTok" : platform === "instagram" ? "Instagram" : "YouTube"}
              </div>
            ) : (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Select value={platform} onValueChange={(v) => v && setPlatform(v as Platform)}>
                  <SelectTrigger className="sm:w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {platforms.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Input placeholder="@handle" value={handle} onChange={(e) => setHandle(e.target.value)} className="flex-1" />
                <Button type="button" variant="outline" disabled={!handle.trim() || connecting} onClick={connectSocial}>
                  <LinkIcon className="size-4" />
                  {connecting ? "Connecting…" : "Connect"}
                </Button>
              </div>
            )}
            {touched && !socialConnected && (
              <Alert variant="destructive" className="mt-3">
                <AlertTriangle className="size-4" />
                <AlertDescription>Connect a social account to continue.</AlertDescription>
              </Alert>
            )}
          </div>

          <Button type="submit" disabled={!canSubmit} className="w-full">
            Finish Setup
          </Button>
          <FieldDescription className="text-center">
            You can connect more accounts and edit this later from Settings.
          </FieldDescription>
        </FieldGroup>
      </form>
    </AuthShell>
  )
}
