import { createTichaServerSupabaseClient } from "@/lib/ticha-supabase-server"
import { NextRequest, NextResponse } from "next/server"

/**
 * This route handles the email confirmation callback from Supabase
 * Users click the confirmation link in their email, which redirects here
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const token_hash = requestUrl.searchParams.get("token_hash")
  const type = requestUrl.searchParams.get("type")
  const next = requestUrl.searchParams.get("next") || "/ticha/dashboard"

  if (token_hash && type) {
    const supabase = await createTichaServerSupabaseClient()

    const { error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    })

    if (!error) {
      // Email confirmed successfully - redirect to dashboard
      return NextResponse.redirect(new URL(`/ticha/dashboard?confirmed=true`, requestUrl.origin))
    }
  }

  // If there's an error or missing params, redirect to sign in with error
  return NextResponse.redirect(new URL(`/ticha/signin?error=confirmation_failed`, requestUrl.origin))
}

