"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Zap, User, Menu, X, LogOut } from "lucide-react"
import { tichaSupabase } from "@/lib/ticha-supabase"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export function TichaHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const isAuthenticated = !!user

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await tichaSupabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    checkUser()

    const { data: { subscription } } = tichaSupabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await tichaSupabase.auth.signOut()
    setMobileMenuOpen(false)
    router.push("/ticha")
    router.refresh()
  }

  const handleStatsClick = () => {
    setMobileMenuOpen(false)
    if (pathname === "/ticha/dashboard") {
      // Scroll to stats section
      setTimeout(() => {
        const statsElement = document.getElementById("stats")
        if (statsElement) {
          statsElement.scrollIntoView({ behavior: "smooth" })
        }
      }, 100)
    } else {
      router.push("/ticha/dashboard#stats")
    }
  }

  return (
    <header
      className="sticky top-0 z-50 w-full border-none"
      style={{
        background: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/ticha" className="flex items-center gap-2">
            <div
              className="p-1.5 rounded-lg"
              style={{
                background: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
                boxShadow: "inset 1px 1px 2px rgba(209, 209, 209, 0.4), inset -1px -1px 2px rgba(255, 255, 255, 0.8)",
              }}
            >
              <Zap className="h-5 w-5 text-gray-900" />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-gray-900" style={{  letterSpacing: "-0.02em" }}>
              TichaAI
            </span>
          </Link>

          {/* Desktop: Show Sign In or Stats Tab */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  href="/ticha/dashboard#stats"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
                  style={{  }}
                >
                  Stats
                </Link>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="rounded-lg border-none text-sm"
                  style={{
                    background: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
                    boxShadow: "2px 2px 4px rgba(209, 209, 209, 0.4), -2px -2px 4px rgba(255, 255, 255, 0.8)",
                    color: "#2d3748",
                    
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                className="rounded-lg border-none text-sm"
                style={{
                  background: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
                  boxShadow: "2px 2px 4px rgba(209, 209, 209, 0.4), -2px -2px 4px rgba(255, 255, 255, 0.8)",
                  color: "#2d3748",
                  
                }}
                asChild
              >
                <Link href="/ticha/signin" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Sign In
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile: Hamburger Menu */}
          {!loading && (
            <button
              className="md:hidden p-2 rounded-lg text-gray-900 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              style={{
                background: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
                boxShadow: "2px 2px 4px rgba(209, 209, 209, 0.4), -2px -2px 4px rgba(255, 255, 255, 0.8)",
              }}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          )}
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && !loading && (
          <div
            className="md:hidden border-t border-gray-300 py-4 space-y-2"
            style={{
              background: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
            }}
          >
            {isAuthenticated ? (
              <>
                <Link
                  href="/ticha/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  style={{  }}
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleStatsClick}
                  className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  style={{  }}
                >
                  Stats
                </button>
                <div className="border-t border-gray-300 my-2"></div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm font-medium text-red-700 hover:text-red-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                  style={{  }}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/ticha/signin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                style={{  }}
              >
                <User className="h-4 w-4" />
                Sign In
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
