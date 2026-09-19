"use client"

import { UserCog, Plus, ClipboardCheck } from "lucide-react"
import { toast } from "sonner"

import { adminUsers } from "@/lib/mock-data"
import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface ModeratorStats {
  reviewedToday: number
  approvalRate: number
  avgSeconds: number
}

const perf: Record<string, ModeratorStats> = {
  "Taylor Brooks": { reviewedToday: 142, approvalRate: 78, avgSeconds: 34 },
}

const seededModerators = [
  { id: "m2", name: "Priya Nair", handle: "@priyamod", reviewedToday: 118, approvalRate: 82, avgSeconds: 41 },
  { id: "m3", name: "Marcus Webb", handle: "@marcusmod", reviewedToday: 96, approvalRate: 71, avgSeconds: 52 },
]

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
}

export function AdminModeratorsView() {
  const platformMods = adminUsers.filter((u) => u.role === "moderator")
  const mods = [
    ...platformMods.map((m) => ({
      id: m.id,
      name: m.name,
      handle: m.handle,
      ...(perf[m.name] ?? { reviewedToday: 0, approvalRate: 0, avgSeconds: 0 }),
    })),
    ...seededModerators,
  ]

  const totalReviewed = mods.reduce((s, m) => s + m.reviewedToday, 0)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Moderators"
        description="Manage the moderation team and monitor review performance."
        action={
          <Button onClick={() => toast.success("Invite sent")}>
            <Plus data-icon="inline-start" />
            Invite moderator
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Active moderators" value={mods.length} icon={UserCog} />
        <StatCard label="Reviewed today" value={totalReviewed} icon={ClipboardCheck} />
        <StatCard label="Avg. approval rate" value="77%" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {mods.map((m) => (
          <Card key={m.id}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Avatar className="size-10">
                  <AvatarFallback>{initials(m.name)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <CardTitle className="text-base">{m.name}</CardTitle>
                  <CardDescription>{m.handle}</CardDescription>
                </div>
                <Badge variant="outline" className="ml-auto">
                  Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Reviewed today</span>
                <span className="font-medium tabular-nums">{m.reviewedToday}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Approval rate</span>
                  <span className="font-medium tabular-nums">{m.approvalRate}%</span>
                </div>
                <Progress value={m.approvalRate} />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Avg. review time</span>
                <span className="font-medium tabular-nums">{m.avgSeconds}s</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
