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
import { useT } from "@/components/i18n/locale-provider"

const statusVariant: Record<string, "outline" | "secondary" | "destructive"> = {
  active: "outline",
  pending: "secondary",
  suspended: "destructive",
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
}

export function AdminUsersView() {
  const t = useT()
  const tabs: { value: Role | "all"; label: string }[] = [
    { value: "all", label: t("adminUsers.all") },
    { value: "creator", label: t("adminUsers.creators") },
    { value: "advertiser", label: t("adminUsers.advertisers") },
    { value: "moderator", label: t("adminUsers.moderators") },
  ]
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
      <PageHeader title={t("adminUsers.title")} description={t("adminUsers.description")} />

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
          <InputGroupInput
            placeholder={t("adminUsers.searchUsers")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </InputGroup>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("adminUsers.user")}</TableHead>
                <TableHead>{t("adminUsers.role")}</TableHead>
                <TableHead>{t("adminUsers.status")}</TableHead>
                <TableHead>{t("adminUsers.joined")}</TableHead>
                <TableHead className="text-right">{t("adminUsers.volume")}</TableHead>
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
                    {u.earningsMinor != null
                      ? formatCurrency(u.earningsMinor)
                      : u.spendMinor != null
                        ? formatCurrency(u.spendMinor)
                        : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontal />
                          <span className="sr-only">{t("adminUsers.actions")}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                          <DropdownMenuItem onClick={() => toast.info(t("adminUsers.viewingToast", { name: u.name }))}>
                            {t("adminUsers.viewProfile")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => toast.success(t("adminUsers.impersonatingToast", { name: u.name }))}
                          >
                            {t("adminUsers.impersonate")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => toast.error(t("adminUsers.suspendedToast", { name: u.name }))}
                          >
                            {t("adminUsers.suspend")}
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
