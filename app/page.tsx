import { AuthProvider } from "@/components/auth/auth-provider"
import { AuthGate } from "@/components/auth/auth-gate"

export default function Page() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  )
}
