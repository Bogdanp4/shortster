"use client"

import { ShieldAlert, Ban, Check } from "lucide-react"
import { toast } from "sonner"

import { fraudCases } from "@/lib/mock-data"
import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { RiskBadge } from "@/components/shared/status-badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

export function AdminFraudView() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Fraud Center" description="Platform-wide fraud monitoring and enforcement." />

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Open cases" value={fraudCases.length} icon={ShieldAlert} />
        <StatCard label="Banned (30d)" value={12} icon={Ban} />
        <StatCard label="Recovered" value="$4,820" />
        <StatCard label="False positives" value="6%" />
      </div>

      <div className="flex flex-col gap-6">
        {fraudCases.map((c) => (
          <Card key={c.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <CardTitle className="flex items-center gap-2">
                    {c.creatorName}
                    <RiskBadge score={c.riskScore} />
                  </CardTitle>
                  <CardDescription>
                    {c.creatorHandle} · {c.campaign} · {c.linkedAccounts} linked accounts
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => toast.success(`Cleared ${c.creatorHandle}`)}>
                    <Check data-icon="inline-start" />
                    Clear
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => toast.error(`Banned ${c.creatorHandle}`)}>
                    <Ban data-icon="inline-start" />
                    Ban
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {c.flags.map((f) => (
                <div key={f.reason} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{f.reason}</span>
                    <Badge variant="secondary">+{f.points}</Badge>
                  </div>
                  <Progress value={f.points} />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
