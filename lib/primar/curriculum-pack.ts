/**
 * Primar curriculum knowledge pack — Nkwa-style category-filtered retrieve.
 *
 * Keyword search over authored outcomes + skill labels. No embeddings yet;
 * structure matches Nkwa `searchKnowledge` (category filter + score + limit).
 */

export type CurriculumCategory = 'reading' | 'numeracy' | 'shapes'

export interface CurriculumChunk {
  id: string
  category: CurriculumCategory
  skillIds: string[]
  title: string
  snippet: string
  snippetFr: string
  tags: string[]
}

export const CURRICULUM_PACK: CurriculumChunk[] = [
  {
    id: 'reading-letter-shape',
    category: 'reading',
    skillIds: ['letter.shape', 'letter.shape.reversal'],
    title: 'Letter shapes',
    snippet:
      'Child tells letters apart by shape. Watch for b/d and p/q reversals — teach slowly with mirrors named gently.',
    snippetFr:
      'L’enfant distingue les lettres par la forme. Attention aux confusions b/d et p/q — enseigner lentement.',
    tags: ['reversal', 'mirror', 'letter', 'shape'],
  },
  {
    id: 'reading-letter-sound',
    category: 'reading',
    skillIds: ['letter.sound'],
    title: 'Letter sounds',
    snippet:
      'Child maps letter to sound, not letter name. Watch for giving the name where the sound is asked.',
    snippetFr:
      'L’enfant relie lettre et son, pas le nom de la lettre. Attention au nom donné à la place du son.',
    tags: ['sound', 'phoneme', 'letter'],
  },
  {
    id: 'reading-rhyme',
    category: 'reading',
    skillIds: ['pa.rhyme'],
    title: 'Rhyming',
    snippet:
      'Child hears shared endings. Name the rhyming pair out loud; never call speech wrong.',
    snippetFr:
      'L’enfant entend les fins qui se ressemblent. Nommer la paire à voix haute ; ne jamais juger la parole.',
    tags: ['rhyme', 'pa', 'sound'],
  },
  {
    id: 'reading-initial',
    category: 'reading',
    skillIds: ['pa.initial'],
    title: 'First sound',
    snippet:
      'Child catches the first sound in a word. Bridge to letter sounds later.',
    snippetFr:
      'L’enfant attrape le premier son d’un mot. Pont vers les sons des lettres plus tard.',
    tags: ['initial', 'onset', 'pa'],
  },
  {
    id: 'reading-decode',
    category: 'reading',
    skillIds: ['decode.build', 'decode.read', 'decode.sentence'],
    title: 'Decoding',
    snippet:
      'Child builds then reads words sound by sound. Watch for right letters in wrong order — sequencing, not phonics alone.',
    snippetFr:
      'L’enfant construit puis lit les mots son après son. Attention aux lettres justes dans le mauvais ordre.',
    tags: ['decode', 'blend', 'spell'],
  },
  {
    id: 'reading-meaning',
    category: 'reading',
    skillIds: ['meaning.word', 'meaning.sentence'],
    title: 'Word meaning',
    snippet:
      'Child links word to meaning. Pictures help but letters do the reading work.',
    snippetFr:
      'L’enfant relie le mot au sens. Les images aident, mais les lettres font le travail.',
    tags: ['meaning', 'picture', 'vocab'],
  },
  {
    id: 'numeracy-count',
    category: 'numeracy',
    skillIds: ['num.count', 'num.numeral', 'num.match'],
    title: 'Counting and numerals',
    snippet:
      'Child counts a group and links it to a numeral. Watch for counting past the last object.',
    snippetFr:
      'L’enfant compte un groupe et le relie au chiffre. Attention au comptage au-delà du dernier objet.',
    tags: ['count', 'cardinality', 'numeral'],
  },
  {
    id: 'numeracy-compare',
    category: 'numeracy',
    skillIds: ['num.compare', 'num.order'],
    title: 'More and less',
    snippet:
      'Child judges which group has more without only using space size. Watch for bigger-looking piles winning.',
    snippetFr:
      'L’enfant juge quel groupe a plus, sans se fier seulement à la taille. Attention aux tas plus grands.',
    tags: ['compare', 'more', 'less'],
  },
  {
    id: 'numeracy-add',
    category: 'numeracy',
    skillIds: ['num.add'],
    title: 'Adding',
    snippet:
      'Child joins two groups. Watch for answering with one operand instead of the total, or recounting from one.',
    snippetFr:
      'L’enfant réunit deux groupes. Attention à répondre avec un seul nombre ou à tout recompter.',
    tags: ['add', 'join', 'total'],
  },
  {
    id: 'numeracy-subtract',
    category: 'numeracy',
    skillIds: ['num.subtract', 'num.missing'],
    title: 'Taking away',
    snippet:
      'Child takes away and finds what is left. Watch for adding when the sign says take away.',
    snippetFr:
      'L’enfant enlève et trouve ce qui reste. Attention à additionner quand le signe dit enlever.',
    tags: ['subtract', 'takeaway', 'missing'],
  },
  {
    id: 'shapes-compose',
    category: 'shapes',
    skillIds: [
      'shape.compose.basic',
      'shape.compose.curve',
      'shape.compose.multi',
    ],
    title: 'Building shapes',
    snippet:
      'Child builds shapes from pieces. Watch for losing one part or treating curves as interchangeable.',
    snippetFr:
      'L’enfant construit des formes avec des pièces. Attention à une pièce manquante ou aux courbes confondues.',
    tags: ['compose', 'shape', 'parts'],
  },
  {
    id: 'shapes-discriminate',
    category: 'shapes',
    skillIds: ['shape.discriminate', 'shape.decompose', 'shape.flex'],
    title: 'Matching shapes',
    snippet:
      'Child matches and takes shapes apart carefully. Looking at edges transfers to letter shapes.',
    snippetFr:
      'L’enfant associe et décompose les formes avec soin. Regarder les bords aide aussi les lettres.',
    tags: ['discriminate', 'decompose', 'shape'],
  },
]

export interface CurriculumHit {
  id: string
  title: string
  snippet: string
  category: CurriculumCategory
  relevanceScore: number
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9àâäéèêëïîôùûüç]+/i)
    .filter((t) => t.length > 1)
}

export function categoryForSkill(skillId?: string | null): CurriculumCategory | null {
  if (!skillId) return null
  if (skillId.startsWith('num.')) return 'numeracy'
  if (skillId.startsWith('shape.')) return 'shapes'
  if (
    skillId.startsWith('pa.') ||
    skillId.startsWith('letter.') ||
    skillId.startsWith('decode.') ||
    skillId.startsWith('meaning.')
  ) {
    return 'reading'
  }
  return null
}

/**
 * Nkwa-style filtered retrieve: prefer skill match, then category, then tags.
 */
export function searchCurriculum(params: {
  query?: string
  skillId?: string | null
  categories?: CurriculumCategory[]
  missTags?: string[]
  locale?: string
  limit?: number
}): CurriculumHit[] {
  const limit = params.limit ?? 2
  const locale = params.locale === 'fr' ? 'fr' : 'en'
  const categories = params.categories?.length
    ? params.categories
    : (() => {
        const c = categoryForSkill(params.skillId)
        return c ? [c] : null
      })()

  const queryTokens = tokenize(
    [params.query, params.skillId, ...(params.missTags ?? [])]
      .filter(Boolean)
      .join(' '),
  )
  const miss = new Set((params.missTags ?? []).map((t) => t.toLowerCase()))

  const scored: CurriculumHit[] = []

  for (const chunk of CURRICULUM_PACK) {
    if (categories && !categories.includes(chunk.category)) continue

    let score = 0
    if (params.skillId && chunk.skillIds.includes(params.skillId)) score += 8

    for (const tag of chunk.tags) {
      if (miss.has(tag)) score += 3
      if (queryTokens.includes(tag)) score += 2
    }

    const hay = tokenize(
      `${chunk.title} ${chunk.snippet} ${chunk.snippetFr} ${chunk.skillIds.join(' ')}`,
    )
    for (const t of queryTokens) {
      if (hay.includes(t)) score += 1
    }

    if (score <= 0 && params.skillId && categories?.includes(chunk.category)) {
      // Soft subject grounding when no skill hit yet.
      score = 0.5
    }

    if (score > 0) {
      scored.push({
        id: chunk.id,
        title: chunk.title,
        snippet: locale === 'fr' ? chunk.snippetFr : chunk.snippet,
        category: chunk.category,
        relevanceScore: score,
      })
    }
  }

  scored.sort((a, b) => b.relevanceScore - a.relevanceScore)
  return scored.slice(0, limit).filter((h) => h.relevanceScore >= 1)
}
