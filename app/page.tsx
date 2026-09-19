import { AppProvider } from "@/components/app/app-provider"
import { DashboardShell } from "@/components/app/dashboard-shell"

export default function Page() {
  return (
    <AppProvider>
      <DashboardShell />
    </AppProvider>
  )
}
