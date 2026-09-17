/**
 * Public tutor cards for the marketing site.
 *
 * The Flutter app already reads `tutor_profiles` (approved, not hidden) for
 * Find Tutors, and writes `tutor_requests` when a signed-in learner asks for a
 * match. This helper is the site-facing slice of that same table: name, photo,
 * subjects, city, rating. No documents, emails, or payout fields.
 *
 * Booking and requesting stay in the app. The site only shows who is approved.
 */

export type PublicTutor = {
  id: string
  name: string
  subjects: string[]
  city: string | null
  rating: number | null
  photoUrl: string | null
  sessions: number | null
}

const PUBLIC_FIELDS = `
  user_id,
  subjects,
  specializations,
  city,
  rating,
  admin_approved_rating,
  profile_photo_url,
  total_sessions_completed,
  status,
  is_hidden,
  profiles:user_id ( full_name, avatar_url )
`

function asList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => String(item)).filter(Boolean)
  if (typeof value === "string" && value.trim()) return [value.trim()]
  return []
}

function profileOf(row: Record<string, unknown>) {
  const raw = row.profiles
  if (Array.isArray(raw)) return (raw[0] as Record<string, unknown> | undefined) ?? null
  if (raw && typeof raw === "object") return raw as Record<string, unknown>
  return null
}

export function toPublicTutor(row: Record<string, unknown>): PublicTutor | null {
  const id = typeof row.user_id === "string" ? row.user_id : null
  if (!id) return null
  const profile = profileOf(row)
  const name = (typeof profile?.full_name === "string" && profile.full_name.trim()) || "Tutor"
  const photo =
    (typeof row.profile_photo_url === "string" && row.profile_photo_url) ||
    (typeof profile?.avatar_url === "string" && profile.avatar_url) ||
    null
  const ratingRaw = row.admin_approved_rating ?? row.rating
  const rating = typeof ratingRaw === "number" && ratingRaw > 0 ? ratingRaw : null
  const sessions = typeof row.total_sessions_completed === "number" ? row.total_sessions_completed : null

  return {
    id,
    name,
    subjects: [...asList(row.subjects), ...asList(row.specializations)].slice(0, 4),
    city: typeof row.city === "string" && row.city.trim() ? row.city : null,
    rating,
    photoUrl: photo,
    sessions,
  }
}

export async function listPublicTutors(limit = 24): Promise<{ tutors: PublicTutor[]; unavailable: boolean }> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { tutors: [], unavailable: true }
  }
  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase-admin")
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from("tutor_profiles")
      .select(PUBLIC_FIELDS)
      .eq("status", "approved")
      .or("is_hidden.is.null,is_hidden.eq.false")
      .limit(Math.min(Math.max(limit, 1), 60))

    if (error) {
      console.error("[tutors/directory] query failed", error.message)
      return { tutors: [], unavailable: true }
    }

    const tutors = (data || [])
      .map((row) => toPublicTutor(row as Record<string, unknown>))
      .filter((row): row is PublicTutor => Boolean(row))
      .sort((a, b) => (b.sessions ?? 0) - (a.sessions ?? 0))

    return { tutors, unavailable: false }
  } catch (error) {
    console.error("[tutors/directory] unavailable", error instanceof Error ? error.message : error)
    return { tutors: [], unavailable: true }
  }
}
