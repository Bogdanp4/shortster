"use client"

import { useMemo, useState } from "react"
import { Search, MoreHorizontal } from "lucide-react"
import { toast } from "sonner"

import { adminUsers } from "@/lib/mock-data"
import { formatCurrency } from "@/lib/format"
import type { Role } from "@/lib/types"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/ui/input-group"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const tabs: { value: Role | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "creator", label: "Creators" },
  { value: "advertiser", label: "Advertisers" },
  { value: "moderator", label: "Moderators" },
]

const statusVariant: Record<string, "outline" | "secondary" | "destructive"> = {
  active: "outline",
  pending: "secondary",
  suspended: "destructive",
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
}

export function AdminUsersView() {
  const [tab, setTab] = useState<Role | "all">("all")
  const [query, setQuery] = useState("")

  const filtered = useMemo(
    () =>
      adminUsers.filter((u) => {
        const matchTab = tab === "all" || u.role === tab
        const matchQuery =
          u.name.toLowerCase().includes(query.toLowerCase()) || u.handle.toLowerCase().includes(query.toLowerCase())
        return matchTab && matchQuery
      }),
    [tab, query],
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Users" description="Manage every account on the platform." />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={tab} onValueChange={(v) => setTab(v as Role | "all")}>
          <TabsList>
            {tabs.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <InputGroup className="sm:max-w-xs">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput placeholder="Search users" value={query} onChange={(e) => setQuery(e.target.value)} />
        </InputGroup>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Volume</TableHead>
                <TableHead className="text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9">
                        <AvatarFallback>{initials(u.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">{u.name}</span>
                        <span className="text-xs text-muted-foreground">{u.handle}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{u.role}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[u.status]} className="capitalize">
                      {u.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.joined}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {u.earnings != null ? formatCurrency(u.earnings) : u.spend != null ? formatCurrency(u.spend) : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontal />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                          <DropdownMenuItem onClick={() => toast.info(`Viewing ${u.name}`)}>View profile</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.success(`Impersonating ${u.name}`)}>
                            Impersonate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => toast.error(`Suspended ${u.name}`)}
                          >
                            Suspend
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
