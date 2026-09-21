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
import { useT } from "@/components/i18n/locale-provider"

export function AdvertiserSettingsView() {
  const t = useT()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("advSettings.title")} description={t("advSettings.description")} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-1 lg:col-span-1">
          <h3 className="text-sm font-medium">{t("advSettings.brandProfile")}</h3>
          <p className="text-sm text-muted-foreground">{t("advSettings.brandProfileDesc")}</p>
        </div>
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="brand">{t("advSettings.brandName")}</FieldLabel>
                <Input id="brand" defaultValue="Stake" />
              </Field>
              <Field>
                <FieldLabel htmlFor="website">{t("advSettings.website")}</FieldLabel>
                <Input id="website" defaultValue="https://stake.com" />
              </Field>
              <Field>
                <FieldLabel htmlFor="bio">{t("advSettings.bio")}</FieldLabel>
                <Textarea id="bio" rows={3} defaultValue="The world's leading crypto casino and sportsbook." />
                <FieldDescription>{t("advSettings.bioHint")}</FieldDescription>
              </Field>
            </FieldGroup>
          </CardContent>
          <CardFooter className="justify-end">
            <Button onClick={() => toast.success(t("advSettings.profileSaved"))}>
              {t("advSettings.saveChanges")}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Separator />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-1 lg:col-span-1">
          <h3 className="text-sm font-medium">{t("advSettings.notifications")}</h3>
          <p className="text-sm text-muted-foreground">{t("advSettings.notificationsDesc")}</p>
        </div>
        <Card className="lg:col-span-2">
          <CardContent className="flex flex-col gap-1 pt-6">
            {[
              { label: t("advSettings.newSubmissions"), desc: t("advSettings.newSubmissionsDesc"), on: true },
              { label: t("advSettings.budgetAlerts"), desc: t("advSettings.budgetAlertsDesc"), on: true },
              { label: t("advSettings.weeklySummary"), desc: t("advSettings.weeklySummaryDesc"), on: false },
              { label: t("advSettings.fraudFlags"), desc: t("advSettings.fraudFlagsDesc"), on: true },
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
