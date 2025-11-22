import { NextRequest, NextResponse } from "next/server"
import { createTichaServerSupabaseClient } from "@/lib/ticha-supabase-server"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim()

    // Check if email exists in ticha_users table
    const supabase = await createTichaServerSupabaseClient()
    
    const { data: existingUser, error } = await supabase
      .from("ticha_users")
      .select("id, email")
      .eq("email", normalizedEmail)
      .maybeSingle()

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "no rows returned" which is fine
      console.error("Error checking email:", error)
      return NextResponse.json(
        { error: "Failed to check email" },
        { status: 500 }
      )
    }

    // Also check auth.users using admin function if available
    // Note: This requires service role key, which we shouldn't expose
    // So we'll rely on ticha_users check + signup error handling

    return NextResponse.json({
      exists: !!existingUser,
      email: normalizedEmail,
    })
  } catch (error: any) {
    console.error("Error in check-email route:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

