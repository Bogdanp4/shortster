"use client"

import { ShieldAlert, Ban, Check, Link2 } from "lucide-react"
import { toast } from "sonner"

import { fraudCases } from "@/lib/mock-data"
import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { RiskBadge } from "@/components/shared/status-badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

export function FraudReviewView() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Fraud Review"
        description="Investigate high-risk creators and take action on suspicious activity."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Open cases" value={fraudCases.length} icon={ShieldAlert} />
        <StatCard label="Accounts banned" value={12} icon={Ban} hint="This month" />
        <StatCard label="Recovered" value="$4,820" hint="Reversed payouts" />
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
                    {c.creatorHandle} · flagged on {c.campaign}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => toast.success(`Cleared ${c.creatorHandle}`)}>
                    <Check data-icon="inline-start" />
                    Clear
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => toast.error(`Banned ${c.creatorHandle}`)}>
                    <Ban data-icon="inline-start" />
                    Ban account
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-6 lg:grid-cols-3">
              <div className="flex flex-col gap-3 lg:col-span-2">
                <span className="text-sm font-medium">Risk signals</span>
                {c.flags.map((f) => (
                  <div key={f.reason} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{f.reason}</span>
                      <span className="font-medium tabular-nums">+{f.points}</span>
                    </div>
                    <Progress value={f.points} />
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-sm font-medium">History</span>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Submissions</span>
                  <span className="font-medium">{c.previousSubmissions}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Rejected</span>
                  <span className="font-medium">{c.rejectedSubmissions}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Link2 className="size-3.5" />
                    Linked accounts
                  </span>
                  <span className="font-medium">{c.linkedAccounts}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
