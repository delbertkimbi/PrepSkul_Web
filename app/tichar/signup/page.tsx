"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { TichaHeader } from "@/components/ticha/header"
import { TichaFooter } from "@/components/ticha/footer"
import { tichaSupabase } from "@/lib/ticha-supabase"
import { Eye, EyeOff, Zap, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SignUpPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [emailResent, setEmailResent] = useState(false)

  const handleResendEmail = async () => {
    if (!email) {
      setError("Please enter your email address first")
      return
    }

    setLoading(true)
    setError("")

    try {
      const { error: resendError } = await tichaSupabase.auth.resend({
        type: "signup",
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/tichar/auth/callback`,
        },
      })

      if (resendError) throw resendError

      setEmailResent(true)
      setTimeout(() => setEmailResent(false), 5000)
    } catch (err: any) {
      setError(err.message || "Failed to resend email. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      // Normalize email (lowercase and trim)
      const normalizedEmail = email.toLowerCase().trim()
      setEmail(normalizedEmail) // Update state with normalized email

      if (!normalizedEmail || !normalizedEmail.includes("@")) {
        setError("Please enter a valid email address")
        setLoading(false)
        return
      }

      // CRITICAL: Check if email already exists BEFORE attempting signup
      // This prevents duplicate signups and false success messages
      let emailExists = false
      try {
        const checkResponse = await fetch("/api/ticha/check-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: normalizedEmail }),
        })

        if (checkResponse.ok) {
          const checkData = await checkResponse.json()
          if (checkData.exists) {
            emailExists = true
          }
        }
      } catch (checkError) {
        // If check fails, also check directly via Supabase query as fallback
        console.warn("API check failed, trying direct query:", checkError)
        try {
          const { data: directCheck } = await tichaSupabase
            .from("ticha_users")
            .select("id")
            .eq("email", normalizedEmail)
            .maybeSingle()
          
          if (directCheck) {
            emailExists = true
          }
        } catch (directError) {
          console.warn("Direct check also failed, proceeding with signup:", directError)
        }
      }

      // If email exists, reject immediately
      if (emailExists) {
        setError("This email address is already registered. Please sign in instead or use a different email.")
        setLoading(false)
        return
      }

      // Try to sign up - Supabase Auth automatically enforces unique emails
      const { data, error: signUpError } = await tichaSupabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: fullName || normalizedEmail.split("@")[0],
          },
          emailRedirectTo: `${window.location.origin}/tichar/auth/callback`,
        },
      })

      if (signUpError) {
        // Handle specific Supabase error codes for duplicate emails
        const errorMessage = signUpError.message?.toLowerCase() || ""
        if (errorMessage.includes("already registered") || 
            errorMessage.includes("already exists") ||
            errorMessage.includes("user already registered") ||
            errorMessage.includes("email address is already in use") ||
            signUpError.status === 422) {
          setError("This email address is already registered. Please sign in instead or use a different email.")
        } else {
          throw signUpError
        }
        setLoading(false)
        return
      }

      // ADDITIONAL CHECK: Verify this is actually a NEW user, not a duplicate
      // Sometimes Supabase returns existing user object for duplicate emails without error
      if (data.user) {
        // Check if user is already confirmed - definitely a duplicate
        if (data.user.email_confirmed_at) {
          setError("This email address is already registered and confirmed. Please sign in instead.")
          setLoading(false)
          return
        }

        // Check user creation time - if it's more than 5 seconds old, it's likely an existing user
        const userCreatedAt = new Date(data.user.created_at).getTime()
        const now = Date.now()
        const timeSinceCreation = now - userCreatedAt

        // If user was created more than 5 seconds ago, it's an existing user being returned
        // (new signups should have been created within the last 5 seconds)
        if (timeSinceCreation > 5000) {
          setError("This email address is already registered. Please sign in instead or use a different email.")
          setLoading(false)
          return
        }

        // Wait a moment for trigger to create profile for new users
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Final verification: Check if profile already existed before this signup
        const { data: profile } = await tichaSupabase
          .from("ticha_users")
          .select("id, created_at")
          .eq("email", normalizedEmail)
          .maybeSingle()

        if (profile) {
          const profileCreatedAt = new Date(profile.created_at).getTime()
          
          // If profile was created more than 2 seconds before user creation, it's a duplicate
          // (new signups create profile via trigger almost instantly)
          if (profileCreatedAt < userCreatedAt - 2000) {
            setError("This email address is already registered. Please sign in instead or use a different email.")
            setLoading(false)
            return
          }
        }
      }

      if (!data.user) {
        throw new Error("Failed to create account")
      }

      // Only show success if we've passed all duplicate checks
      setSuccess(true)
    } catch (err: any) {
      // Handle duplicate email errors
      const errorMessage = err.message?.toLowerCase() || ""
      if (errorMessage.includes("already registered") || 
          errorMessage.includes("already exists") ||
          errorMessage.includes("user already registered") ||
          errorMessage.includes("email address is already in use") ||
          err.status === 422) {
        setError("This email address is already registered. Please sign in instead or use a different email.")
      } else if (errorMessage.includes("password")) {
        setError(err.message || "Invalid password. Please check your password requirements.")
      } else if (errorMessage.includes("email")) {
        setError(err.message || "Invalid email address. Please check your email and try again.")
      } else {
        setError(err.message || "Sign up failed. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",  }}>
      <TichaHeader />

      <main className="flex-1 flex items-center justify-center px-3 sm:px-4 lg:px-8 py-6 sm:py-12">
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
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1 sm:mb-2" style={{  fontWeight: 800 }}>
                Create Account
              </h1>
              <p className="text-sm sm:text-base text-gray-600" style={{  }}>
                Start creating amazing presentations
              </p>
            </div>

            {success && (
              <div
                className="mb-5 sm:mb-6 p-4 sm:p-5 rounded-xl border-none"
                style={{
                  background: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
                  boxShadow: "inset 2px 2px 4px rgba(209, 209, 209, 0.4), inset -2px -2px 4px rgba(255, 255, 255, 0.8)",
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="p-2 rounded-lg flex-shrink-0"
                    style={{
                      background: "linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)",
                      boxShadow: "inset 1px 1px 2px rgba(190, 190, 190, 0.3), inset -1px -1px 2px rgba(255, 255, 255, 0.7)",
                    }}
                  >
                    <Mail className="h-5 w-5 text-green-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm sm:text-base text-gray-900 mb-1.5" style={{  }}>
                      Check your email
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-3" style={{  }}>
                      We sent a confirmation link to <span className="font-medium text-gray-900 break-all">{email}</span>
                    </p>
                    {emailResent && (
                      <p className="text-xs text-green-700 mb-2" style={{  }}>
                        ✓ Email resent successfully!
                      </p>
                    )}
                    <button
                      onClick={handleResendEmail}
                      disabled={loading}
                      className="text-xs sm:text-sm text-gray-700 hover:text-gray-900 underline font-medium"
                      style={{  }}
                    >
                      {loading ? "Sending..." : "Resend email"}
                    </button>
                  </div>
                </div>
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

            <form onSubmit={handleSignUp} className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm sm:text-base text-gray-900 font-medium" style={{  }}>
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="border-none rounded-xl text-sm sm:text-base"
                  style={{
                    background: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
                    boxShadow: "inset 2px 2px 4px rgba(209, 209, 209, 0.4), inset -2px -2px 4px rgba(255, 255, 255, 0.8)",
                    color: "#2d3748",
                    
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm sm:text-base text-gray-900 font-medium" style={{  }}>
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
                <Label htmlFor="password" className="text-sm sm:text-base text-gray-900 font-medium" style={{  }}>
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
                    minLength={6}
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
                <p className="text-xs text-gray-500" style={{  }}>
                  Must be at least 6 characters
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading || success}
                className="w-full rounded-xl border-none text-sm sm:text-base font-semibold"
                style={{
                  background: loading || success
                    ? "linear-gradient(135deg, #d1d1d1 0%, #e8e8e8 100%)"
                    : "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
                  boxShadow: loading || success
                    ? "inset 2px 2px 4px rgba(209, 209, 209, 0.4), inset -2px -2px 4px rgba(255, 255, 255, 0.8)"
                    : "3px 3px 8px rgba(190, 190, 190, 0.4), -3px -3px 8px rgba(255, 255, 255, 0.8)",
                  color: "#2d3748",
                  
                }}
              >
                {loading ? "Creating..." : success ? "Email Sent!" : "Create Account"}
              </Button>
            </form>

            <div className="mt-5 sm:mt-6 text-center">
              <p className="text-xs sm:text-sm text-gray-600" style={{  }}>
                Already have an account?{" "}
                <Link
                  href="/tichar/signin"
                  className="font-semibold text-gray-900 hover:underline"
                  style={{  }}
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <TichaFooter />
    </div>
  )
}
