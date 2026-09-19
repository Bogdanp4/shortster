"use client"

import { toast } from "sonner"

import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

export function AdvertiserSettingsView() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" description="Manage your brand profile and notification preferences." />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-1 lg:col-span-1">
          <h3 className="text-sm font-medium">Brand profile</h3>
          <p className="text-sm text-muted-foreground">How your brand appears to creators.</p>
        </div>
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="brand">Brand name</FieldLabel>
                <Input id="brand" defaultValue="Stake" />
              </Field>
              <Field>
                <FieldLabel htmlFor="website">Website</FieldLabel>
                <Input id="website" defaultValue="https://stake.com" />
              </Field>
              <Field>
                <FieldLabel htmlFor="bio">Bio</FieldLabel>
                <Textarea id="bio" rows={3} defaultValue="The world's leading crypto casino and sportsbook." />
                <FieldDescription>Shown on your public campaign pages.</FieldDescription>
              </Field>
            </FieldGroup>
          </CardContent>
          <CardFooter className="justify-end">
            <Button onClick={() => toast.success("Profile saved")}>Save changes</Button>
          </CardFooter>
        </Card>
      </div>

      <Separator />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-1 lg:col-span-1">
          <h3 className="text-sm font-medium">Notifications</h3>
          <p className="text-sm text-muted-foreground">Choose what you get emailed about.</p>
        </div>
        <Card className="lg:col-span-2">
          <CardContent className="flex flex-col gap-1 pt-6">
            {[
              { label: "New submissions", desc: "When a creator submits a video to your campaign", on: true },
              { label: "Budget alerts", desc: "When a campaign reaches 80% of its budget", on: true },
              { label: "Weekly summary", desc: "A digest of your campaign performance", on: false },
              { label: "Fraud flags", desc: "When our system flags suspicious activity", on: true },
            ].map((item, i, arr) => (
              <div key={item.label}>
                <div className="flex items-center justify-between py-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-sm text-muted-foreground">{item.desc}</span>
                  </div>
                  <Switch defaultChecked={item.on} />
                </div>
                {i < arr.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
