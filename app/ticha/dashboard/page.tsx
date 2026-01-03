"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { TichaHeader } from "@/components/ticha/header"
import { TichaFooter } from "@/components/ticha/footer"
import { tichaSupabase } from "@/lib/ticha-supabase"

export default function TichaDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await tichaSupabase.auth.getUser()
      const currentUser = data.user

      if (!currentUser) {
        router.push("/ticha/signin")
        return
      }

      setUser(currentUser)
      setLoading(false)
    }

    checkUser()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)" }}>
        <TichaHeader />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">Loading dashboard...</p>
        </main>
        <TichaFooter />
      </div>
    )
  }

  // Once the user is loaded, send them to the main Ticha page
  // so they always see the full upload + text input UI to use the model.
  if (user) {
    router.replace("/ticha")
    return null
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)" }}>
      <TichaHeader />
      <main className="flex-1 flex items-center justify-center">
        <p className="text-gray-900 text-lg font-semibold">
          Welcome back. Your dashboard will appear here.
        </p>
      </main>
      <TichaFooter />
    </div>
  )
}
