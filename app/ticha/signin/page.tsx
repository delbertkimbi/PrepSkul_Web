"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { TichaHeader } from "@/components/ticha/header"
import { TichaFooter } from "@/components/ticha/footer"
import { tichaSupabase } from "@/lib/ticha-supabase"
import { Eye, EyeOff, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function SignInContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    if (searchParams.get("confirmed") === "true") {
      setConfirmed(true)
      setTimeout(() => setConfirmed(false), 5000)
    }
    
    if (searchParams.get("error") === "confirmation_failed") {
      setError("Email confirmation failed. Please try signing up again or contact support.")
    }
  }, [searchParams])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Normalize email (lowercase and trim)
      const normalizedEmail = email.toLowerCase().trim()
      setEmail(normalizedEmail) // Update state with normalized email

      if (!normalizedEmail || !normalizedEmail.includes("@")) {
        setError("Please enter a valid email address")
        setLoading(false)
        return
      }

      const { data, error: signInError } = await tichaSupabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      })

      if (signInError) throw signInError

      if (!data.user) {
        throw new Error("No user returned")
      }

      router.push("/ticha/dashboard")
      router.refresh()
    } catch (err: any) {
      // Provide better error messages
      const errorMessage = err.message?.toLowerCase() || ""
      if (errorMessage.includes("invalid") || errorMessage.includes("incorrect")) {
        setError("Invalid email or password. Please check your credentials and try again.")
      } else if (errorMessage.includes("email not confirmed")) {
        setError("Please confirm your email address before signing in. Check your inbox for the confirmation link.")
      } else {
        setError(err.message || "Sign in failed. Please check your credentials.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div
        className="rounded-xl sm:rounded-2xl p-5 sm:p-7 md:p-10 border-none"
        style={{
          background: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
          boxShadow: "3px 3px 8px rgba(190, 190, 190, 0.4), -3px -3px 8px rgba(255, 255, 255, 0.8)",
        }}
      >
        <div className="text-center mb-5 sm:mb-8">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div
              className="p-2 sm:p-3 rounded-lg sm:rounded-xl"
              style={{
                background: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
                boxShadow: "inset 2px 2px 4px rgba(190, 190, 190, 0.4), inset -2px -2px 4px rgba(255, 255, 255, 0.8)",
              }}
            >
              <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-gray-900" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
            Welcome Back
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Sign in to continue to TichaAI
          </p>
        </div>

        {confirmed && (
          <div
            className="mb-5 sm:mb-6 p-4 rounded-xl border-none text-green-800 text-sm"
            style={{
              background: "linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)",
              boxShadow: "inset 2px 2px 4px rgba(190, 190, 190, 0.2), inset -2px -2px 4px rgba(255, 255, 255, 0.6)",
            }}
          >
            ✓ Email confirmed successfully! You can now sign in.
          </div>
        )}

        {error && (
          <div
            className="mb-5 sm:mb-6 p-4 rounded-xl border-none text-red-800 text-sm"
            style={{
              background: "linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)",
              boxShadow: "inset 2px 2px 4px rgba(190, 190, 190, 0.2), inset -2px -2px 4px rgba(255, 255, 255, 0.6)",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm sm:text-base text-gray-900 font-medium">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="border-none rounded-xl text-sm sm:text-base"
              style={{
                background: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
                boxShadow: "inset 2px 2px 4px rgba(209, 209, 209, 0.4), inset -2px -2px 4px rgba(255, 255, 255, 0.8)",
                color: "#2d3748",
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm sm:text-base text-gray-900 font-medium">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="border-none rounded-xl pr-10 text-sm sm:text-base"
                style={{
                  background: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
                  boxShadow: "inset 2px 2px 4px rgba(209, 209, 209, 0.4), inset -2px -2px 4px rgba(255, 255, 255, 0.8)",
                  color: "#2d3748",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
              >
                {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl border-none text-sm sm:text-base font-semibold"
            style={{
              background: loading
                ? "linear-gradient(135deg, #d1d1d1 0%, #e8e8e8 100%)"
                : "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
              boxShadow: loading
                ? "inset 2px 2px 4px rgba(209, 209, 209, 0.4), inset -2px -2px 4px rgba(255, 255, 255, 0.8)"
                : "3px 3px 8px rgba(190, 190, 190, 0.4), -3px -3px 8px rgba(255, 255, 255, 0.8)",
              color: "#2d3748",
            }}
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-5 sm:mt-6 text-center space-y-2">
          <p className="text-xs sm:text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              href="/ticha/signup"
              className="font-semibold text-gray-900 hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)" }}>
      <TichaHeader />

      <main className="flex-1 flex items-center justify-center px-3 sm:px-4 lg:px-8 py-6 sm:py-12">
        <Suspense fallback={<div className="w-full max-w-md h-96 flex items-center justify-center">Loading...</div>}>
          <SignInContent />
        </Suspense>
      </main>

      <TichaFooter />
    </div>
  )
}
