import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const palettes = [
  "bg-chart-1/20 text-chart-1",
  "bg-chart-2/20 text-chart-2",
  "bg-chart-3/20 text-chart-3",
  "bg-chart-4/20 text-chart-4",
  "bg-chart-5/20 text-chart-5",
]

function hash(input: string) {
  let h = 0
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0
  return h
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase()
}

export function BrandAvatar({
  name,
  src,
  className,
}: {
  name: string
  src?: string
  className?: string
}) {
  const palette = palettes[hash(name) % palettes.length]
  return (
    <Avatar className={cn("rounded-lg", className)}>
      {src && <AvatarImage src={src} alt={name} />}
      <AvatarFallback className={cn("rounded-lg font-semibold", palette)}>{initials(name)}</AvatarFallback>
    </Avatar>
  )
}
