import { NextResponse } from "next/server"
import { listPublicTutors } from "@/lib/tutors/directory"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * GET /api/tutors/directory
 *
 * Public, read-only cards from `tutor_profiles`. The Flutter Find Tutors
 * screen and authenticated `tutor_requests` flow stay in the app.
 */
export async function GET() {
  const { tutors, unavailable } = await listPublicTutors(24)
  return NextResponse.json({ tutors, unavailable })
}
