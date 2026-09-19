"use client"

import { useState } from "react"
import { useApp } from "./app-provider"
import { Logo } from "./logo"
import { SidebarNav } from "./sidebar-nav"
import { RoleSwitcher } from "./role-switcher"
import { NotificationsMenu } from "./notifications-menu"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/ui/input-group"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Search } from "lucide-react"
import { roleLabels } from "@/lib/nav"
import { formatCurrency } from "@/lib/format"

export function TopHeader() {
  const { role, creatorWallet, advertiserWallet, navigate } = useApp()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl lg:px-6">
      <div className="flex items-center gap-2 lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Open menu" />}>
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="border-b border-border/60">
              <SheetTitle className="flex items-center">
                <Logo />
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-4 p-4">
              <RoleSwitcher />
              <SidebarNav onNavigate={() => setMobileOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
        <Logo showWordmark={false} />
      </div>

      <div className="hidden max-w-md flex-1 lg:block">
        <InputGroup>
          <InputGroupInput placeholder={`Search ${roleLabels[role].toLowerCase()} workspace...`} />
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
            aria-label="View earnings"
          >
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Balance</span>
              <span className="text-sm font-semibold tabular-nums">{formatCurrency(creatorWallet.available)}</span>
            </div>
          </button>
        )}
        {role === "advertiser" && (
          <button
            type="button"
            onClick={() => navigate("wallet")}
            className="hidden items-center gap-2 rounded-lg border border-border/60 px-3 py-1.5 text-left transition-colors hover:bg-muted/50 sm:flex"
            aria-label="View wallet"
          >
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Available</span>
              <span className="text-sm font-semibold tabular-nums">{formatCurrency(advertiserWallet.available)}</span>
            </div>
          </button>
        )}
        <NotificationsMenu />
        <Avatar className="size-9 border border-border/60">
          <AvatarFallback className="bg-primary/12 text-sm font-semibold text-primary">AR</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
