import { LocaleProvider } from "@/components/i18n/locale-provider"
import { AuthProvider } from "@/components/auth/auth-provider"
import { AuthGate } from "@/components/auth/auth-gate"

export default function Page() {
  return (
    <LocaleProvider>
      <AuthProvider>
        <AuthGate />
      </AuthProvider>
    </LocaleProvider>
  )
}
