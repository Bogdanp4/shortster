"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { notifications as seed } from "@/lib/mock-data"
import { formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useT } from "@/components/i18n/locale-provider"
import { Bell, CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react"

const kindMeta = {
  success: { icon: CheckCircle2, className: "text-success" },
  warning: { icon: AlertTriangle, className: "text-warning" },
  danger: { icon: XCircle, className: "text-destructive" },
  info: { icon: Info, className: "text-info" },
}

export function NotificationsMenu() {
  const t = useT()
  const [items, setItems] = useState(seed)
  const unread = items.filter((i) => !i.read).length

  return (
    <Popover>
      <PopoverTrigger
        render={<Button variant="ghost" size="icon" aria-label={t("notif.ariaLabel")} className="relative" />}
      >
        <Bell className="size-5" />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 flex size-2 items-center justify-center">
            <span className="absolute inline-flex size-2 animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm font-semibold">{t("notif.title")}</span>
          {unread > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-xs"
              onClick={() => setItems((prev) => prev.map((i) => ({ ...i, read: true })))}
            >
              {t("notif.markAllRead")}
            </Button>
          )}
        </div>
        <Separator />
        <ScrollArea className="h-80">
          <div className="flex flex-col">
            {items.map((n) => {
              const meta = kindMeta[n.kind]
              const Icon = meta.icon
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => setItems((prev) => prev.map((i) => (i.id === n.id ? { ...i, read: true } : i)))}
                  className={cn(
                    "flex gap-3 border-b border-border/50 px-4 py-3 text-left transition-colors last:border-0 hover:bg-muted/50",
                    !n.read && "bg-primary/[0.04]",
                  )}
                >
                  <Icon className={cn("mt-0.5 size-4 shrink-0", meta.className)} />
                  <div className="flex flex-1 flex-col gap-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium leading-tight">{n.title}</span>
                      {!n.read && <span className="size-1.5 shrink-0 rounded-full bg-primary" />}
                    </div>
                    <span className="text-xs text-muted-foreground">{n.detail}</span>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground">{n.time}</span>
                      {n.amountMinor != null && (
                        <span className="text-[11px] font-medium text-success">{formatMoney(n.amountMinor)}</span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
