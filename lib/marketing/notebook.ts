export type NotebookPost = {
  id: string
  locale: "en" | "fr"
  slug: string
  title: string
  excerpt: string
  body: string
  tile: string
  publishedAt: string
  updatedAt: string
}

const EN_FALLBACK: NotebookPost[] = [
  {
    id: "fallback-listen",
    locale: "en",
    slug: "skulmate-asks-before-it-answers",
    title: "SkulMate asks before it answers",
    excerpt: "A chatbot dumps the solution. Mate holds the miss, asks a focusing question, and lets the learner reason through it.",
    body: "PrepSkul is the tutoring product. SkulMate is the tutor inside the app. When a learner says 2x + 3 = 11, Mate does not recite x = 4. He asks what moves first so x stands alone, draws the step, and waits. That is the difference between a cheatbot and a tutor.\n\nParents in Douala, Buea, Bamenda, and Yaoundé use the same product. Voice stays on without a tap. Type if the phone is shared. A human PrepSkul tutor can join live online or at the table when a person in the room is the right next step.",
    tile: "/onboard/art/tile-heart.png",
    publishedAt: "2026-09-10T08:00:00.000Z",
    updatedAt: "2026-09-17T08:00:00.000Z",
  },
  {
    id: "fallback-hybrid",
    locale: "en",
    slug: "online-or-at-the-table",
    title: "Online, or at the table",
    excerpt: "Browse approved tutors on this site. Book a live class or an onsite visit in the app, with the same database behind both.",
    body: "The public tutor list on PrepSkul.com is the same approved tutor_profiles the app uses. No invented names. Booking, payment, and a tutor request live in the app because they need a signed-in account.\n\nChoose live online when the learner can talk through the board from home. Choose onsite when a person at the table is what the week needs. SkulMate can hold the in-between days so the human hour is not the only hour.",
    tile: "/onboard/art/tile-laptop.png",
    publishedAt: "2026-09-08T08:00:00.000Z",
    updatedAt: "2026-09-16T08:00:00.000Z",
  },
  {
    id: "fallback-parents",
    locale: "en",
    slug: "what-parents-see-after-a-session",
    title: "What parents see after a session",
    excerpt: "A short picture of what was covered, what is firm, and what is still sticky. The parent seat is a learner seat too, not a spy cam.",
    body: "Parents who study in PrepSkul get their own lessons. They can also read a session summary: skills worked, mistakes that keep returning, and what to retry. Mate keeps an assistance ledger so the next session starts from the miss, not from chapter one.\n\nInvite every learner under the same roof. SIL through University. Maths, languages, sciences, and the skill the family actually needs.",
    tile: "/onboard/art/tile-medal.png",
    publishedAt: "2026-09-05T08:00:00.000Z",
    updatedAt: "2026-09-15T08:00:00.000Z",
  },
]

const FR_FALLBACK: NotebookPost[] = [
  {
    id: "fallback-listen-fr",
    locale: "fr",
    slug: "skulmate-demande-avant-de-repondre",
    title: "SkulMate demande avant de répondre",
    excerpt: "Un chatbot dump la solution. Mate tient le raté, pose une question, et laisse l’apprenant raisonner.",
    body: "PrepSkul est le produit de tutorat. SkulMate est le tuteur dans l’app. Quand un élève dit 2x + 3 = 11, Mate ne récite pas x = 4. Il demande ce qu’on déplace d’abord, dessine l’étape, et attend.\n\nLes parents à Douala, Buea, Bamenda et Yaoundé utilisent le même produit. La voix reste ouverte sans tapoter. On tape si le téléphone est partagé. Un tuteur humain peut rejoindre en direct ou à table.",
    tile: "/onboard/art/tile-heart.png",
    publishedAt: "2026-09-10T08:00:00.000Z",
    updatedAt: "2026-09-17T08:00:00.000Z",
  },
  {
    id: "fallback-hybrid-fr",
    locale: "fr",
    slug: "en-ligne-ou-a-table",
    title: "En ligne, ou à table",
    excerpt: "Parcours les tuteurs approuvés ici. Réserve un cours live ou une visite sur place dans l’app, sur la même base.",
    body: "La liste publique de PrepSkul.com vient des mêmes tutor_profiles approuvés que l’app. Pas de noms inventés. Réservation, paiement et demande de tuteur vivent dans l’app, avec un compte.\n\nEn ligne quand on peut parler depuis la maison. Sur place quand une personne à table est ce qu’il faut cette semaine. SkulMate tient les jours entre les deux.",
    tile: "/onboard/art/tile-laptop.png",
    publishedAt: "2026-09-08T08:00:00.000Z",
    updatedAt: "2026-09-16T08:00:00.000Z",
  },
  {
    id: "fallback-parents-fr",
    locale: "fr",
    slug: "ce-que-voient-les-parents",
    title: "Ce que voient les parents après une séance",
    excerpt: "Un résumé de ce qui est vu, ce qui tient, ce qui accroche. Le siège parent apprend aussi. Ce n’est pas une caméra.",
    body: "Les parents qui étudient dans PrepSkul ont leurs propres leçons. Ils peuvent aussi lire un résumé: compétences, erreurs qui reviennent, ce qu’il faut rejouer. Mate tient un journal d’aide pour que la séance suivante parte du raté, pas du chapitre un.\n\nInvite chaque apprenant sous le même toit. De la SIL à l’université.",
    tile: "/onboard/art/tile-medal.png",
    publishedAt: "2026-09-05T08:00:00.000Z",
    updatedAt: "2026-09-15T08:00:00.000Z",
  },
]

export function fallbackNotebook(locale: string): NotebookPost[] {
  return locale.startsWith("fr") ? FR_FALLBACK : EN_FALLBACK
}

function loc(locale: string): "en" | "fr" {
  return locale.startsWith("fr") ? "fr" : "en"
}

function toPost(row: Record<string, unknown>, locale: "en" | "fr"): NotebookPost | null {
  const slug = typeof row.slug === "string" ? row.slug : ""
  const title = typeof row.title === "string" ? row.title : ""
  if (!slug || !title) return null
  return {
    id: typeof row.id === "string" ? row.id : slug,
    locale,
    slug,
    title,
    excerpt: typeof row.excerpt === "string" ? row.excerpt : "",
    body: typeof row.body === "string" ? row.body : "",
    tile: typeof row.tile === "string" && row.tile ? row.tile : "/onboard/art/tile-book.png",
    publishedAt: typeof row.published_at === "string" ? row.published_at : new Date().toISOString(),
    updatedAt: typeof row.updated_at === "string" ? row.updated_at : new Date().toISOString(),
  }
}

export async function listNotebookPosts(locale: string, limit = 3): Promise<NotebookPost[]> {
  const language = loc(locale)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return fallbackNotebook(language).slice(0, limit)
  }
  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase-admin")
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from("marketing_blocks")
      .select("id, slug, title, excerpt, body, tile, published_at, updated_at")
      .eq("slot", "notebook")
      .eq("locale", language)
      .eq("published", true)
      .order("sort", { ascending: true })
      .order("published_at", { ascending: false })
      .limit(limit)
    if (error || !data?.length) return fallbackNotebook(language).slice(0, limit)
    const posts = data.map((row) => toPost(row as Record<string, unknown>, language)).filter(Boolean) as NotebookPost[]
    return posts.length ? posts : fallbackNotebook(language).slice(0, limit)
  } catch {
    return fallbackNotebook(language).slice(0, limit)
  }
}

export async function getNotebookPost(locale: string, slug: string): Promise<NotebookPost | null> {
  const language = loc(locale)
  const fromFallback = fallbackNotebook(language).find((post) => post.slug === slug) ?? null
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return fromFallback
  }
  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase-admin")
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from("marketing_blocks")
      .select("id, slug, title, excerpt, body, tile, published_at, updated_at")
      .eq("slot", "notebook")
      .eq("locale", language)
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle()
    if (error || !data) return fromFallback
    return toPost(data as Record<string, unknown>, language) ?? fromFallback
  } catch {
    return fromFallback
  }
}

export async function listAllNotebookPosts(): Promise<NotebookPost[]> {
  const [en, fr] = await Promise.all([listNotebookPosts("en", 24), listNotebookPosts("fr", 24)])
  const seen = new Set<string>()
  return [...en, ...fr].filter((post) => {
    const key = `${post.locale}:${post.slug}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
