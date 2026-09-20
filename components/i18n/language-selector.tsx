"use client"

import { useLocale } from "./locale-provider"
import { locales, type Locale } from "@/lib/i18n/dictionary"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Globe, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const shortLabels: Record<Locale, string> = { en: "EN", ru: "RU" }

export function LanguageSelector({ className }: { className?: string }) {
  const { locale, setLocale, t } = useLocale()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="sm" className={cn("gap-2", className)} />}
        aria-label={t("language.label")}
      >
        <Globe className="size-4" />
        <span className="text-sm font-medium">{shortLabels[locale]}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">{t("language.label")}</div>
        <DropdownMenuGroup>
          {locales.map((l) => (
            <DropdownMenuItem key={l} onClick={() => setLocale(l)} className="gap-2">
              <span className="flex-1">{t(`language.${l}`)}</span>
              {l === locale && <Check className="size-4 text-primary" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
