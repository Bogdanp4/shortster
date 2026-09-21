"use client"

import { useState } from "react"
import { useApp } from "./app-provider"
import { useAuth } from "@/components/auth/auth-provider"
import { useT } from "@/components/i18n/locale-provider"
import { Logo } from "./logo"
import { SidebarNav } from "./sidebar-nav"
import { RoleSwitcher } from "./role-switcher"
import { NotificationsMenu } from "./notifications-menu"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/ui/input-group"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, Search, LogOut, ArrowLeftRight, Check } from "lucide-react"
import { roleLabels } from "@/lib/nav"
import { formatCurrency } from "@/lib/format"
import { DEMO_ROLE_OVERRIDE_ENABLED } from "@/lib/dev-config"

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("")
}

export function TopHeader() {
  const { role, creatorWallet, advertiserWallet, navigate } = useApp()
  const { currentUser, signOut, switchWorkspace } = useAuth()
  const t = useT()
  const [mobileOpen, setMobileOpen] = useState(false)
  const workspaces = currentUser?.roles.filter((r) => r === "creator" || r === "advertiser") ?? []

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl lg:px-6">
      <div className="flex items-center gap-2 lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger render={<Button variant="ghost" size="icon" aria-label={t("common.openMenu")} />}>
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="border-b border-border/60">
              <SheetTitle className="flex items-center">
                <Logo />
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-4 p-4">
              {DEMO_ROLE_OVERRIDE_ENABLED && <RoleSwitcher />}
              <SidebarNav onNavigate={() => setMobileOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
        <Logo showWordmark={false} />
      </div>

      <div className="hidden max-w-md flex-1 lg:block">
        <InputGroup>
          <InputGroupInput placeholder={t("shell.searchWorkspace", { role: t(`roles.${role}`) })} />
          <InputGroupAddon>
            <Search className="size-4 text-muted-foreground" />
          </InputGroupAddon>
        </InputGroup>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {role === "creator" && (
          <button
            type="button"
            onClick={() => navigate("earnings")}
            className="hidden items-center gap-2 rounded-lg border border-border/60 px-3 py-1.5 text-left transition-colors hover:bg-muted/50 sm:flex"
            aria-label={t("shell.balance")}
          >
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{t("shell.balance")}</span>
              <span className="text-sm font-semibold tabular-nums">{formatCurrency(creatorWallet.availableMinor)}</span>
            </div>
          </button>
        )}
        {role === "advertiser" && (
          <button
            type="button"
            onClick={() => navigate("wallet")}
            className="hidden items-center gap-2 rounded-lg border border-border/60 px-3 py-1.5 text-left transition-colors hover:bg-muted/50 sm:flex"
            aria-label={t("shell.available")}
          >
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{t("shell.available")}</span>
              <span className="text-sm font-semibold tabular-nums">{formatCurrency(advertiserWallet.availableMinor)}</span>
            </div>
          </button>
        )}
        <NotificationsMenu />
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon" className="rounded-full" aria-label={t("common.accountMenu")} />}
          >
            <Avatar className="size-9 border border-border/60">
              <AvatarFallback className="bg-primary/12 text-sm font-semibold text-primary">
                {currentUser ? initials(currentUser.name) : "SH"}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {currentUser && (
              <DropdownMenuGroup>
                <DropdownMenuLabel className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium leading-none">{currentUser.name}</span>
                  <span className="text-xs font-normal text-muted-foreground">{currentUser.email}</span>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
            )}
            {workspaces.length > 1 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">{t("profile.switchWorkspace")}</div>
                  {workspaces.map((r) => (
                    <DropdownMenuItem key={r} onClick={() => switchWorkspace(r)} className="gap-2">
                      <ArrowLeftRight className="size-4 text-muted-foreground" />
                      <span className="flex-1">{t(`roles.${r}`)}</span>
                      {r === currentUser?.activeWorkspace && <Check className="size-4 text-primary" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="gap-2 text-destructive focus:text-destructive">
              <LogOut className="size-4" />
              {t("common.signOut")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
