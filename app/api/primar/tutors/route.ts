import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

/**
 * Tutors a SkulMate learner can reach for help.
 *
 * ## Why this is its own route
 *
 * The rest of the app finds tutors through search, filters and a booking flow
 * built for a parent choosing someone for a term. A child stuck on a word
 * needs the opposite: the shortest path from "I am stuck" to a person. Reusing
 * the search endpoint would mean shipping a marketplace to a six-year-old.
 *
 * ## What it deliberately does not do
 *
 * **It does not start a call and it does not mint an RTC token.** Joining a
 * channel goes through `/api/agora/token`, which validates that the caller is
 * actually party to a session before issuing anything. A second token path
 * that skipped that check would be a hole big enough to walk a stranger
 * through, and the users on the far side of it are children.
 *
 * **It does not claim anyone is online.** There is no presence column on
 * `tutor_profiles` — see the note on `live` below. Rather than infer presence
 * from something that does not mean presence, every tutor is reported as not
 * live, and the client offers "ask for a call" rather than "call now". A green
 * dot that is a guess is worse than no green dot: it makes a child wait for
 * someone who was never there.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Shape the Flutter client depends on. Keep additive. */
type TutorCard = {
  id: string
  name: string
  subjects: string[]
  city: string | null
  rating: number | null
  /**
   * Reachable this minute.
   *
   * Always false today, and typed as a boolean so the client does not have to
   * change when it stops being. Turning it on needs a presence signal that does
   * not exist yet — a heartbeat written by the tutor app, or an availability
   * window on the profile. Deriving it from `status` or from recent sessions
   * would be presence-shaped and not presence.
   */
  live: boolean
  photoUrl: string | null
  sessions: number | null
  languages: string[]
}

/**
 * Only what a child's screen needs.
 *
 * Emphatically not `select('*')`: that table carries identity documents,
 * addresses and payout details, and this is the least authenticated surface in
 * the product.
 */
const FIELDS = `
  user_id,
  subjects,
  specializations,
  languages,
  city,
  rating,
  admin_approved_rating,
  total_reviews,
  profile_photo_url,
  total_sessions_completed,
  status,
  is_hidden,
  profiles:user_id ( full_name )
`

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const subject = params.get('subject') || 'reading'
  const locale = params.get('locale') === 'fr' ? 'fr' : 'en'

  try {
    // The service-role client, and only because of the name.
    //
    // A tutor's display name lives on `profiles`, which RLS closes to an
    // unauthenticated reader — so the join came back null and every tutor was
    // rendered as the word "Tutor". SkulMate has no signed-in user to read it
    // as, and it should not need one to answer "who can help my child".
    //
    // This is safe here only because the field list is a closed allowlist of
    // things that are already public on a tutor's profile page. It must stay
    // that way: with this client, adding `select('*')` would publish identity
    // documents and payout details to an unauthenticated endpoint.
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from('tutor_profiles')
      .select(FIELDS)
      // Approved only, and no fallback to pending. A pending tutor has not
      // cleared the safety check, and this is the one surface where the other
      // end is a child alone with a phone.
      .eq('status', 'approved')
      // Hidden tutors are hidden for a reason — usually a complaint under
      // review. They must not surface on the one screen aimed at children.
      .or('is_hidden.is.null,is_hidden.eq.false')
      .limit(60)

    if (error) {
      console.error('[primar/tutors] query failed', error.message)
      // An empty list rather than a failure status: the tab degrades to
      // "nobody yet", which is true and harmless, instead of showing a child
      // an error they cannot act on.
      return NextResponse.json({ tutors: [], reason: 'unavailable' })
    }

    const want = subject.toLowerCase()
    const wantLanguage = locale === 'fr' ? 'french' : 'english'

    const tutors: TutorCard[] = (data || [])
      .map((row: any) => ({
        id: row.user_id,
        // The name lives on `profiles`, not here. `tutor_profiles.full_name`
        // does not exist, which is the kind of thing only a real request
        // finds — the query simply returned an error and the tab showed an
        // empty list that looked exactly like "no tutors yet".
        name: row.profiles?.full_name || 'Tutor',
        subjects: [...(row.subjects || []), ...(row.specializations || [])],
        languages: (row.languages || []).map((l: any) => String(l).toLowerCase()),
        city: row.city ?? null,
        // The admin-approved figure wins where there is one — the raw rating
        // is user-submitted and the approved one has been looked at.
        rating: row.admin_approved_rating ?? row.rating ?? null,
        live: false,
        photoUrl: row.profile_photo_url ?? null,
        sessions:
          typeof row.total_sessions_completed === 'number'
            ? row.total_sessions_completed
            : null,
      }))
      // Speaking the child's language is not a preference here, it is the
      // whole point of the call. Tutors who listed no language at all are kept
      // rather than dropped — a missing field is not evidence of anything.
      .filter(
        (t) => t.languages.length === 0 || t.languages.includes(wantLanguage),
      )
      .sort((a, b) => {
        // Whoever teaches this subject first, then whoever has taught most.
        const aMatch = a.subjects.some((s) => s.toLowerCase().includes(want))
        const bMatch = b.subjects.some((s) => s.toLowerCase().includes(want))
        if (aMatch !== bMatch) return aMatch ? -1 : 1
        return (b.sessions ?? 0) - (a.sessions ?? 0)
      })

    return NextResponse.json({ tutors, subject, locale })
  } catch (error) {
    console.error('[primar/tutors] request error', error)
    return NextResponse.json({ tutors: [], reason: 'unavailable' })
  }
}
