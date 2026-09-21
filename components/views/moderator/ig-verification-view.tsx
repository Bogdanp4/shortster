"use client"

import { Check, X, Camera, Clock } from "lucide-react"
import { toast } from "sonner"

import { igVerifications } from "@/lib/mock-data"
import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useT } from "@/components/i18n/locale-provider"

export function IgVerificationView() {
  const t = useT()
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("igVerify.title")}
        description={t("igVerify.description")}
      />

      <Alert>
        <Camera />
        <AlertTitle>{t("igVerify.howItWorks")}</AlertTitle>
        <AlertDescription>{t("igVerify.howItWorksDesc")}</AlertDescription>
      </Alert>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={t("igVerify.pending")} value={igVerifications.length} icon={Clock} />
        <StatCard label={t("igVerify.verifiedToday")} value={18} icon={Check} />
        <StatCard label={t("igVerify.expiredToday")} value={3} icon={X} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {igVerifications.map((v) => (
          <Card key={v.id}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                  <Camera className="size-5" />
                </div>
                <div className="flex flex-col">
                  <CardTitle className="text-base">{v.userName}</CardTitle>
                  <CardDescription>{v.handle}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-muted-foreground">{t("igVerify.challengeCode")}</span>
                <code className="rounded-md bg-muted px-3 py-2 font-mono text-sm">{v.challenge}</code>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="size-3.5" />
                {t("igVerify.expiresIn", { minutes: v.expiresInMinutes })}
                <Badge variant="secondary" className="ml-auto">
                  {v.status}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => window.open(`https://instagram.com/${v.handle.replace("@", "")}`, "_blank")}
                >
                  <Camera data-icon="inline-start" />
                  {t("igVerify.openProfile")}
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => toast.success(t("igVerify.verifiedToast", { handle: v.handle }))}
                >
                  <Check data-icon="inline-start" />
                  {t("igVerify.verify")}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
