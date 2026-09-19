import type { Role } from "./types"
import {
  Compass,
  FileVideo,
  Wallet,
  Link2,
  LayoutDashboard,
  Megaphone,
  PlusCircle,
  BarChart3,
  Users,
  Settings,
  ClipboardCheck,
  Camera,
  ShieldAlert,
  History,
  Receipt,
  ScrollText,
  Building2,
  Banknote,
  UserCog,
  type LucideIcon,
} from "lucide-react"

export interface NavItem {
  key: string
  label: string
  icon: LucideIcon
}

export const roleLabels: Record<Role, string> = {
  creator: "Creator",
  advertiser: "Advertiser",
  moderator: "Moderator",
  admin: "Admin",
}

export const navConfig: Record<Role, NavItem[]> = {
  creator: [
    { key: "discover", label: "Discover", icon: Compass },
    { key: "submissions", label: "My Submissions", icon: FileVideo },
    { key: "earnings", label: "Earnings", icon: Wallet },
    { key: "social", label: "Social Accounts", icon: Link2 },
  ],
  advertiser: [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "campaigns", label: "Campaigns", icon: Megaphone },
    { key: "create", label: "Create Campaign", icon: PlusCircle },
    { key: "adv-submissions", label: "Submissions", icon: FileVideo },
    { key: "analytics", label: "Analytics", icon: BarChart3 },
    { key: "wallet", label: "Wallet & Billing", icon: Wallet },
    { key: "team", label: "Team", icon: Users },
    { key: "adv-settings", label: "Settings", icon: Settings },
  ],
  moderator: [
    { key: "queue", label: "Review Queue", icon: ClipboardCheck },
    { key: "ig-verify", label: "Instagram Verification", icon: Camera },
    { key: "fraud", label: "Fraud Review", icon: ShieldAlert },
    { key: "history", label: "History", icon: History },
  ],
  admin: [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "users", label: "Users", icon: Users },
    { key: "advertisers", label: "Advertisers", icon: Building2 },
    { key: "admin-campaigns", label: "Campaigns", icon: Megaphone },
    { key: "admin-submissions", label: "Submissions", icon: FileVideo },
    { key: "moderators", label: "Moderators", icon: UserCog },
    { key: "transactions", label: "Transactions", icon: Receipt },
    { key: "withdrawals", label: "Withdrawals", icon: Banknote },
    { key: "admin-fraud", label: "Fraud", icon: ShieldAlert },
    { key: "audit", label: "Audit Logs", icon: ScrollText },
  ],
}

export const defaultView: Record<Role, string> = {
  creator: "discover",
  advertiser: "overview",
  moderator: "queue",
  admin: "dashboard",
}
