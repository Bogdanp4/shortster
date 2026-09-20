"use client"

import { useApp } from "./app-provider"
import { useT } from "@/components/i18n/locale-provider"
import type { Role } from "@/lib/types"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Sparkles, Megaphone, ShieldCheck, Crown, ChevronsUpDown, Check } from "lucide-react"

const roleMeta: Record<Role, { icon: typeof Sparkles; descKey: string }> = {
  creator: { icon: Sparkles, descKey: "profile.creatorDesc" },
  advertiser: { icon: Megaphone, descKey: "profile.advertiserDesc" },
  moderator: { icon: ShieldCheck, descKey: "profile.moderatorDesc" },
  admin: { icon: Crown, descKey: "profile.adminDesc" },
}

export function RoleSwitcher() {
  const { role, setRole } = useApp()
  const t = useT()
  const Icon = roleMeta[role].icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" className="h-auto w-full justify-between gap-2 py-2" />
        }
      >
        <span className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary/12 text-primary">
            <Icon className="size-4" />
          </span>
          <span className="flex flex-col items-start">
            <span className="text-xs text-muted-foreground">{t("profile.viewingAs")}</span>
            <span className="text-sm font-medium leading-none">{t(`roles.${role}`)}</span>
          </span>
        </span>
        <ChevronsUpDown className="size-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[--anchor-width] min-w-56" align="start">
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">{t("profile.switchRole")}</div>
        <DropdownMenuGroup>
          {(Object.keys(roleMeta) as Role[]).map((r) => {
            const RIcon = roleMeta[r].icon
            return (
              <DropdownMenuItem key={r} onClick={() => setRole(r)} className="gap-2.5 py-2">
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-md",
                    r === role ? "bg-primary/12 text-primary" : "bg-muted text-muted-foreground",
                  )}
                >
                  <RIcon className="size-4" />
                </span>
                <span className="flex flex-col">
                  <span className="text-sm font-medium">{t(`roles.${r}`)}</span>
                  <span className="text-xs text-muted-foreground">{t(roleMeta[r].descKey)}</span>
                </span>
                {r === role && <Check className="ml-auto size-4 text-primary" />}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
