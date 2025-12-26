"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { TichaHeader } from "@/components/ticha/header"
import { TichaFooter } from "@/components/ticha/footer"
import { tichaSupabase } from "@/lib/ticha-supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileText } from "lucide-react"
import type { User } from "@supabase/supabase-js"

export default function TichaDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [presentations, setPresentations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"stats" | null>("stats")

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await tichaSupabase.auth.getUser()
      
      if (!user) {
        router.push("/tichar/signin")
        return
      }

      setUser(user)

      // Fetch user profile
      const { data: profile } = await tichaSupabase
        .from("ticha_users")
        .select("*")
        .eq("id", user.id)
        .maybeSingle()

      setUserProfile(profile)

      // Fetch presentations
      const { data: userPresentations } = await tichaSupabase
        .from("ticha_presentations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      setPresentations(userPresentations || [])
      setLoading(false)

      // Check if stats tab should be active (from hash)
      if (typeof window !== "undefined" && window.location.hash === "#stats") {
        setActiveTab("stats")
        // Scroll to stats section
        setTimeout(() => {
          const statsElement = document.getElementById("stats")
          if (statsElement) {
            statsElement.scrollIntoView({ behavior: "smooth" })
          }
        }, 100)
      }
    }

    checkUser()

    const { data: { subscription } } = tichaSupabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push("/tichar/signin")
      } else {
        setUser(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const hasNoPresentations = presentations.length === 0
  const totalPresentations = presentations.length
  const processingCount = presentations.filter(p => p.status === "processing").length
  const completedCount = presentations.filter(p => p.status === "completed").length

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",  }}>
        <TichaHeader />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">Loading...</p>
        </main>
        <TichaFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",  }}>
      <TichaHeader />

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2" style={{  fontWeight: 800 }}>
              Welcome back{userProfile?.full_name ? `, ${userProfile.full_name}` : ""}!
            </h1>
            <p className="text-sm sm:text-base text-gray-600" style={{  }}>
              {user?.email}
            </p>
          </div>

          {/* No Presentations Card - Show immediately if no presentations */}
          {hasNoPresentations ? (
            <Card
              className="border-none rounded-xl sm:rounded-2xl mb-6 sm:mb-8"
              style={{
                background: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
                boxShadow: "3px 3px 8px rgba(190, 190, 190, 0.4), -3px -3px 8px rgba(255, 255, 255, 0.8)",
              }}
            >
              <CardContent className="p-6 sm:p-8">
                <div className="text-center py-8 sm:py-12">
                  <div
                    className="inline-flex p-3 sm:p-4 rounded-xl mb-4"
                    style={{
                      background: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
                      boxShadow: "inset 2px 2px 4px rgba(190, 190, 190, 0.4), inset -2px -2px 4px rgba(255, 255, 255, 0.8)",
                    }}
                  >
                    <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-gray-900" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2" style={{  fontWeight: 700 }}>
                    No presentations yet
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-6" style={{  }}>
                    Start creating your first presentation by going to the home page
                  </p>
                  <Button
                    onClick={() => router.push("/tichar")}
                    className="rounded-xl border-none text-sm sm:text-base"
                    style={{
                      background: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
                      boxShadow: "2px 2px 4px rgba(209, 209, 209, 0.4), -2px -2px 4px rgba(255, 255, 255, 0.8)",
                      color: "#2d3748",
                      
                    }}
                  >
                    Create Presentation
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {/* Stats Tab (Desktop) / Section (Mobile) */}
          <div id="stats" className="mb-6 sm:mb-8">
            {/* Desktop: Stats as Tab */}
            <div className="hidden md:block mb-6">
              <div className="flex items-center gap-2 border-b border-gray-300">
                <button
                  onClick={() => setActiveTab("stats")}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                    activeTab === "stats"
                      ? "text-gray-900"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  style={{
                    
                    background: activeTab === "stats" ? "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)" : "transparent",
                    boxShadow: activeTab === "stats" ? "inset 2px 2px 4px rgba(209, 209, 209, 0.4), inset -2px -2px 4px rgba(255, 255, 255, 0.8)" : "none",
                  }}
                >
                  Stats
                </button>
              </div>
            </div>

            {/* Stats Cards - Always visible */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <Card
                  className="border-none rounded-xl sm:rounded-2xl"
                  style={{
                    background: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
                    boxShadow: "3px 3px 8px rgba(190, 190, 190, 0.4), -3px -3px 8px rgba(255, 255, 255, 0.8)",
                  }}
                >
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600 mb-1" style={{  }}>
                          Total Presentations
                        </p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900" style={{  }}>
                          {totalPresentations}
                        </p>
                      </div>
                      <div
                        className="p-2 sm:p-3 rounded-xl"
                        style={{
                          background: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
                          boxShadow: "inset 2px 2px 4px rgba(190, 190, 190, 0.4), inset -2px -2px 4px rgba(255, 255, 255, 0.8)",
                        }}
                      >
                        <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-gray-900" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className="border-none rounded-xl sm:rounded-2xl"
                  style={{
                    background: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
                    boxShadow: "3px 3px 8px rgba(190, 190, 190, 0.4), -3px -3px 8px rgba(255, 255, 255, 0.8)",
                  }}
                >
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600 mb-1" style={{  }}>
                          Processing
                        </p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900" style={{  }}>
                          {processingCount}
                        </p>
                      </div>
                      <div
                        className="p-2 sm:p-3 rounded-xl"
                        style={{
                          background: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
                          boxShadow: "inset 2px 2px 4px rgba(190, 190, 190, 0.4), inset -2px -2px 4px rgba(255, 255, 255, 0.8)",
                        }}
                      >
                        <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-gray-900" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className="border-none rounded-xl sm:rounded-2xl"
                  style={{
                    background: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
                    boxShadow: "3px 3px 8px rgba(190, 190, 190, 0.4), -3px -3px 8px rgba(255, 255, 255, 0.8)",
                  }}
                >
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600 mb-1" style={{  }}>
                          Completed
                        </p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900" style={{  }}>
                          {completedCount}
                        </p>
                      </div>
                      <div
                        className="p-2 sm:p-3 rounded-xl"
                        style={{
                          background: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
                          boxShadow: "inset 2px 2px 4px rgba(190, 190, 190, 0.4), inset -2px -2px 4px rgba(255, 255, 255, 0.8)",
                        }}
                      >
                        <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-gray-900" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
          </div>

          {/* Presentations List (If user has presentations) */}
          {!hasNoPresentations && (
            <div className="mt-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4" style={{  fontWeight: 700 }}>
                Your Presentations
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {presentations.map((presentation) => (
                  <Card
                    key={presentation.id}
                    className="border-none rounded-xl sm:rounded-2xl cursor-pointer hover:scale-105 transition-transform"
                    style={{
                      background: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
                      boxShadow: "3px 3px 8px rgba(190, 190, 190, 0.4), -3px -3px 8px rgba(255, 255, 255, 0.8)",
                    }}
                  >
                    <CardContent className="p-5 sm:p-6">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h3 className="text-base sm:text-lg font-bold text-gray-900 line-clamp-2" style={{  fontWeight: 700 }}>
                            {presentation.title || "Untitled Presentation"}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-lg text-xs font-medium ${
                              presentation.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : presentation.status === "processing"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {presentation.status}
                          </span>
                        </div>
                        {presentation.description && (
                          <p className="text-sm text-gray-600 line-clamp-2" style={{  }}>
                            {presentation.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-500" style={{  }}>
                          {new Date(presentation.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <TichaFooter />
    </div>
  )
}
