"use client"

import { UserPlus, Mail } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useT } from "@/components/i18n/locale-provider"

const members = [
  { id: "m1", name: "Jamie Fox", email: "jamie@stake.com", role: "Owner", status: "active" },
  { id: "m2", name: "Priya Nair", email: "priya@stake.com", role: "Admin", status: "active" },
  { id: "m3", name: "Marco Diaz", email: "marco@stake.com", role: "Editor", status: "active" },
  { id: "m4", name: "Lena Okoro", email: "lena@stake.com", role: "Viewer", status: "invited" },
]

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
}

export function AdvertiserTeamView() {
  const t = useT()
  const roleLabel: Record<string, string> = {
    Owner: t("advTeam.roleOwner"),
    Admin: t("advTeam.roleAdmin"),
    Editor: t("advTeam.roleEditor"),
    Viewer: t("advTeam.roleViewer"),
  }
  const statusLabel: Record<string, string> = {
    active: t("advTeam.statusActive"),
    invited: t("advTeam.statusInvited"),
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("advTeam.title")} description={t("advTeam.description")}>
        <Dialog>
          <DialogTrigger
            render={
              <Button>
                <UserPlus data-icon="inline-start" />
                {t("advTeam.inviteMember")}
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("advTeam.inviteDialogTitle")}</DialogTitle>
              <DialogDescription>{t("advTeam.inviteDialogDesc")}</DialogDescription>
            </DialogHeader>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">{t("advTeam.emailAddress")}</FieldLabel>
                <Input id="email" type="email" placeholder="teammate@company.com" />
              </Field>
              <Field>
                <FieldLabel htmlFor="role">{t("advTeam.role")}</FieldLabel>
                <Select defaultValue="editor">
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="admin">{t("advTeam.roleAdmin")}</SelectItem>
                      <SelectItem value="editor">{t("advTeam.roleEditor")}</SelectItem>
                      <SelectItem value="viewer">{t("advTeam.roleViewer")}</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
            <DialogFooter>
              <DialogClose render={<Button variant="outline">{t("advTeam.cancel")}</Button>} />
              <DialogClose
                render={
                  <Button onClick={() => toast.success(t("advTeam.invitationSent"))}>
                    <Mail data-icon="inline-start" />
                    {t("advTeam.sendInvite")}
                  </Button>
                }
              />
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>{t("advTeam.members")}</CardTitle>
          <CardDescription>{t("advTeam.peopleInWorkspace", { count: members.length })}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("advTeam.member")}</TableHead>
                <TableHead>{t("advTeam.role")}</TableHead>
                <TableHead>{t("advTeam.status")}</TableHead>
                <TableHead className="text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9">
                        <AvatarFallback>{initials(m.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">{m.name}</span>
                        <span className="text-xs text-muted-foreground">{m.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={m.role === "Owner" ? "default" : "secondary"}>{roleLabel[m.role]}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={m.status === "active" ? "outline" : "secondary"}>{statusLabel[m.status]}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" disabled={m.role === "Owner"}>
                      {t("advTeam.manage")}
                    </Button>
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
