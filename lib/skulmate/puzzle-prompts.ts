/**
 * Text-first puzzle_pieces prompt pack — single source of truth for generation.
 * Matches Flutter client: pick_one, hotspot_drop (label→slot), order_check.
 */

export type PuzzleSubjectProfile =
  | 'biology'
  | 'history'
  | 'maths'
  | 'cs'
  | 'general'

export const PUZZLE_MASTER_SYSTEM_BLOCK = `You are designing a TEXT-FIRST step-by-step puzzle lesson (like Gizmo/Quizlet Learn).
Output exactly ONE item with puzzleSteps (6 steps, max 8). needsImage: false everywhere.

LESSON ARC (follow this order):
1. Hook — surprising fact or "which of these is true?"
2. Key term — define one concept from the notes
3. Match — hotspot_drop: pair labels to slots
4. Sequence — order_check: tap stages in order
5. Trap — pick_one with a common misconception as distractor
6. Synthesize — apply concept to a short scenario

STEP TYPES:
• pick_one — 2–4 choices, exactly 1 correct. Prompt ≤120 chars.
• hotspot_drop — NO image. hotspots = slots with "label" (slot description).
  dragLabels = answer pills. Each hotspot.accepts = one dragLabel.id (1:1).
• order_check — 3–4 choices; orderSequence = ids in correct order.

QUALITY RULES:
- Every prompt must quote or paraphrase the SOURCE (names, formulas, dates, steps).
- Distractors = real misconceptions from the material, not nonsense.
- Explanations = 2–3 sentences for "Why" (learn-more sheet).
- puzzlePieces fallback: {id, text: short title, order} per step.

BANNED:
- "What happens first?", "Select the correct answer", "Option A/B"
- x,y,w,h coordinates (client ignores them)
- needsImage / imagePrompt
- Repeating the same question across steps`

export const PUZZLE_STEP_MICRO_PROMPTS: Record<
  'pick_one' | 'hotspot_drop' | 'order_check',
  string
> = {
  pick_one:
    'Write a question that names a specific term from the notes. 2–4 options; one correct; others are mistakes students actually make.',
  hotspot_drop:
    'Create 2–3 slots (hotspots[].label = empty slot description). Create same-count dragLabels. Set each accepts to the matching label id. Shuffle label order.',
  order_check:
    'List 3–4 stages from the notes. orderSequence must match the order taught in class, not alphabetical.',
}

const SUBJECT_KEYWORDS: Record<
  Exclude<PuzzleSubjectProfile, 'general'>,
  RegExp[]
> = {
  biology: [
    /\b(cell|mitochondria|chloroplast|photosynthesis|organism|enzyme|dna|rna|ecosystem|organ|tissue|species|gce\s*o\/?l|biology|stroma|thylakoid)\b/i,
  ],
  history: [
    /\b(treaty|war|revolution|empire|colonial|unification|wwi|wwii|century|dynasty|independence|historical|primary\s+source)\b/i,
  ],
  maths: [
    /\b(equation|formula|quadratic|theorem|algebra|calculus|geometry|ohm|voltage|derivative|integral|=\s*[^=]+)\b/i,
    /\\[a-zA-Z]+/,
  ],
  cs: [
    /\b(soa|service-oriented|api|http|database|server|client|microservice|rest|json|algorithm|programming|software\s+architecture)\b/i,
  ],
}

function scoreSubject(
  haystack: string,
  profile: Exclude<PuzzleSubjectProfile, 'general'>,
): number {
  let score = 0
  for (const pattern of SUBJECT_KEYWORDS[profile]) {
    const matches = haystack.match(new RegExp(pattern.source, 'gi'))
    if (matches) score += matches.length
  }
  return score
}

/** Keyword heuristic on notes + topic; falls back to general. */
export function detectPuzzleSubjectProfile(
  text: string,
  topic?: string,
): PuzzleSubjectProfile {
  const haystack = `${topic ?? ''} ${text}`.trim()
  if (!haystack) return 'general'

  const profiles = ['biology', 'history', 'maths', 'cs'] as const
  let best: PuzzleSubjectProfile = 'general'
  let bestScore = 0

  for (const profile of profiles) {
    const s = scoreSubject(haystack, profile)
    if (s > bestScore) {
      bestScore = s
      best = profile
    }
  }

  return bestScore > 0 ? best : 'general'
}

function subjectTopicLabel(topic?: string): string {
  const t = topic?.trim()
  return t && t.length > 0 ? t : 'the topic from the notes'
}

export function buildPuzzleSubjectAddendum(
  profile: PuzzleSubjectProfile,
  topic?: string,
): string {
  const label = subjectTopicLabel(topic)

  switch (profile) {
    case 'biology':
      return `SUBJECT TEMPLATE (Biology / GCE Science):
From these notes, build a 6-step puzzle on ${label}.
Step 1: pick_one on organelle or function.
Step 2: hotspot_drop — match 3 processes to locations (e.g. thylakoid, stroma, mitochondria).
Step 3: order_check — stages of the process in order.
Step 4: pick_one — common exam trap (e.g. chloroplast vs mitochondria).
Step 5: hotspot_drop — match terms to definitions as slots.
Step 6: pick_one — apply to a Cameroon plant/agriculture example if relevant.
Use GCE O/L level vocabulary. needsImage: false.`

    case 'history':
      return `SUBJECT TEMPLATE (History / Humanities):
Build a 6-step puzzle on ${label}.
Step 1: pick_one — identify the correct cause vs effect.
Step 2: order_check — chronological order of 3–4 events from the notes.
Step 3: hotspot_drop — match leaders/terms to their roles (slots = "Led unification", "Signed treaty").
Step 4: pick_one — which source best supports a claim from the notes.
Step 5: order_check — steps in a political process.
Step 6: pick_one — consequence synthesis question.
Short prompts, exam-style distractors. needsImage: false.`

    case 'maths':
      return `SUBJECT TEMPLATE (Maths / Formulas):
Build a 6-step puzzle on ${label}.
Step 1: pick_one — when to use the formula.
Step 2: hotspot_drop — match symbols to meaning (slot: "Voltage", label pill: "V").
Step 3: order_check — steps to solve a sample problem.
Step 4: pick_one — spot the wrong rearrangement.
Step 5: hotspot_drop — match units to quantities.
Step 6: pick_one — word problem application.
Keep numbers from the notes where possible. needsImage: false.`

    case 'cs':
      return `SUBJECT TEMPLATE (CS / SOA / Systems):
Build a 6-step puzzle on ${label}.
Step 1: pick_one — principle definition.
Step 2: hotspot_drop — match principle → benefit slot (Reusability → "Use same service in many apps").
Step 3: order_check — request lifecycle or design steps.
Step 4: pick_one — architecture misconception.
Step 5: hotspot_drop — match component to responsibility.
Step 6: pick_one — mini scenario ("Which service should handle payments?").
needsImage: false.`

    case 'general':
      return ''
  }
}

/** Reference JSON — 6 steps following the lesson arc (SOA example). */
export const PUZZLE_JSON_EXAMPLE = {
  needsImage: false,
  puzzleSteps: [
    {
      id: 's1',
      type: 'pick_one',
      prompt: 'Which statement about SOA is true?',
      explanation:
        'SOA organizes software as reusable services with clear contracts.',
      choices: [
        { id: 'a', text: 'Services are loosely coupled', correct: true },
        { id: 'b', text: 'All logic must live in one monolith', correct: false },
      ],
    },
    {
      id: 's2',
      type: 'pick_one',
      prompt: 'Which SOA principle lets you reuse a login service in many apps?',
      explanation:
        'Reusability means building once and consuming from multiple systems.',
      choices: [
        { id: 'a', text: 'Reusability', correct: true },
        { id: 'b', text: 'Tight coupling', correct: false },
        { id: 'c', text: 'Monolith-only design', correct: false },
      ],
    },
    {
      id: 's3',
      type: 'hotspot_drop',
      prompt: 'Match each layer to its job',
      explanation:
        'Presentation handles UI; business logic enforces rules; data layer stores records.',
      hotspots: [
        {
          id: 'slot_ui',
          label: 'Shows screens to users',
          accepts: 'lbl_pres',
        },
        {
          id: 'slot_data',
          label: 'Stores customer records',
          accepts: 'lbl_data',
        },
      ],
      dragLabels: [
        { id: 'lbl_pres', text: 'Presentation layer' },
        { id: 'lbl_data', text: 'Data layer' },
      ],
    },
    {
      id: 's4',
      type: 'order_check',
      prompt: 'Tap the HTTP request flow in order',
      explanation:
        'Client sends request → server routes → handler responds.',
      choices: [
        { id: 'c1', text: 'Client sends request' },
        { id: 'c2', text: 'Server routes to handler' },
        { id: 'c3', text: 'Response returns to client' },
      ],
      orderSequence: ['c1', 'c2', 'c3'],
    },
    {
      id: 's5',
      type: 'pick_one',
      prompt: 'Tight coupling between services mainly increases what risk?',
      explanation:
        'Tight coupling makes changes ripple across systems — a common SOA misconception.',
      choices: [
        { id: 'a', text: 'Change breaks many dependents', correct: true },
        { id: 'b', text: 'Easier independent scaling', correct: false },
      ],
    },
    {
      id: 's6',
      type: 'pick_one',
      prompt: 'Which service should handle payment processing in an e-shop?',
      explanation:
        'Payments belong in a dedicated payment service, not the catalog UI.',
      choices: [
        { id: 'a', text: 'Payment service', correct: true },
        { id: 'b', text: 'Product listing page only', correct: false },
      ],
    },
  ],
  puzzlePieces: [
    { id: 's1', text: 'SOA hook', order: 0 },
    { id: 's2', text: 'Reusability', order: 1 },
    { id: 's3', text: 'Match layers', order: 2 },
    { id: 's4', text: 'HTTP flow', order: 3 },
    { id: 's5', text: 'Coupling trap', order: 4 },
    { id: 's6', text: 'Apply scenario', order: 5 },
  ],
}

export type BuildPuzzleUserPromptInput = {
  topic?: string
  text: string
}

/** Full user-prompt section appended when gameType is puzzle_pieces. */
export function buildPuzzleUserPromptSection(
  input: BuildPuzzleUserPromptInput,
): string {
  const profile = detectPuzzleSubjectProfile(input.text, input.topic)
  const subjectAddendum = buildPuzzleSubjectAddendum(profile, input.topic)

  const lines: string[] = [
    '=== PUZZLE_PIECES GENERATION (TEXT-FIRST) ===',
    PUZZLE_MASTER_SYSTEM_BLOCK,
    '',
    `Detected subject profile: ${profile}`,
  ]

  if (subjectAddendum) {
    lines.push('', subjectAddendum)
  }

  lines.push(
    '',
    'STEP-TYPE MICRO-PROMPTS:',
    `• pick_one: ${PUZZLE_STEP_MICRO_PROMPTS.pick_one}`,
    `• hotspot_drop: ${PUZZLE_STEP_MICRO_PROMPTS.hotspot_drop}`,
    `• order_check: ${PUZZLE_STEP_MICRO_PROMPTS.order_check}`,
    '',
    'EXAMPLE JSON (structure only — replace all content with SOURCE material):',
    JSON.stringify(PUZZLE_JSON_EXAMPLE),
    '',
    '- Create exactly ONE item with puzzleSteps: 6 steps (max 8). needsImage: false.',
    '- Follow the lesson arc step order; rotate types pick_one → hotspot_drop → order_check as needed.',
    '- Include puzzlePieces fallback mirroring each step.',
  )

  if (input.topic?.trim()) {
    lines.push(
      `- Topic Focus: Every step MUST use concrete terms from the notes about ${input.topic.trim()}.`,
    )
  }

  return lines.join('\n')
}

/** True when notes look like a process/sequence — useful for auto game-type selection. */
export function hasProcessSequenceSignals(text: string): boolean {
  const t = text.toLowerCase()
  return (
    /\bstep\s*\d+\b/.test(t) ||
    /\b(first|second|third|then|next|finally|lastly)\b/.test(t) ||
    /^\s*\d+[\).\]]\s+/m.test(text) ||
    /\bstage\s*\d+\b/.test(t) ||
    /\bphase\s*\d+\b/.test(t)
  )
}
