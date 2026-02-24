/**
 * skulMate Challenge from Session API
 * Generates a revision challenge from session_summary + transcript (normal recurring sessions only)
 * POST /api/skulmate/challenge/from-session
 * Body: { sessionId: string }
 * Returns: { success, game: { id, title, gameType, items }, ... }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { callOpenRouterWithKey } from '@/lib/ticha/openrouter'
import { aggregateTranscript } from '@/lib/services/va/va.service'

function getSkulMateApiKey(): string {
  const key = process.env.SKULMATE_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY
  if (!key) {
    throw new Error('Missing SKULMATE_OPENROUTER_API_KEY or OPENROUTER_API_KEY')
  }
  return key
}

interface GameItem {
  question?: string
  options?: string[]
  correctAnswer?: number
  explanation?: string
  isBoss?: boolean
}

interface GenerateRequest {
  sessionId: string
}

// CORS headers for Flutter web
function corsHeaders(origin: string | null): Record<string, string> {
  return {
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Origin': origin || '*',
    ...(origin && { 'Access-Control-Allow-Credentials': 'true' }),
  }
}

interface LearningObject {
  topic?: string
  subtopics?: string[]
  key_points?: string[]
  definitions?: { term: string; definition: string }[]
  examples?: string[]
  formulas?: string[]
}

/**
 * Step 1: Structure transcript/summary into learning object per PRD
 */
async function structureContent(
  summary: string,
  transcript: string,
  apiKey: string
): Promise<LearningObject> {
  const combinedInput = `## Session Summary\n${summary}\n\n## Transcript\n${transcript || '(No transcript)'}`
  const prompt = `You are PrepSkul's content structuring assistant. Convert session content into a structured learning object for revision.

Input (summary + transcript):
${combinedInput.substring(0, 8000)}

Output valid JSON only:
{
  "topic": "string",
  "subtopics": ["string"],
  "key_points": ["string"],
  "definitions": [{"term": "string", "definition": "string"}],
  "examples": ["string"],
  "formulas": ["string"]
}

Rules:
- Extract only what was explicitly covered in the session
- Keep key_points concise (1 sentence each)
- definitions: formal definitions of terms taught
- examples: concrete examples from the session
- If a section has no content, use empty array []
- Be accurate; do not invent content`

  const response = await callOpenRouterWithKey(apiKey, {
    model: 'openai/gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You output only valid JSON. No markdown, no explanation.' },
      { role: 'user', content: prompt },
    ],
    max_tokens: 1500,
    temperature: 0.3,
  })

  const content = response.choices?.[0]?.message?.content?.trim()
  if (!content) throw new Error('Empty structure response')

  const jsonMatch = content.match(/\{[\s\S]*\}/)
  const jsonContent = jsonMatch ? jsonMatch[0] : content
  return JSON.parse(jsonContent) as LearningObject
}

/**
 * Step 2: Generate 5-8 quiz questions from structured learning object
 * Last question is the "boss" question (harder, bonus XP)
 */
async function generateChallengeQuestions(
  learningObject: LearningObject,
  apiKey: string
): Promise<{ title: string; items: GameItem[] }> {
  const structuredInput = JSON.stringify(learningObject, null, 2)
  const prompt = `You are PrepSkul's question generator. Create a 5-Minute Revision Challenge from this structured learning object.

INPUT (structured learning object from tutoring session):
${structuredInput.substring(0, 6000)}

OUTPUT: Generate exactly 5-8 multiple choice quiz questions. JSON only, no markdown.

RULES:
1. All questions MUST be based ONLY on the learning object above - no generic or made-up content
2. Use key_points, definitions, examples, formulas from the object
3. Each question: question (string), options (array of 4 strings), correctAnswer (0-based index), explanation (string)
4. The LAST question must be the "boss" question: slightly harder, tests deeper understanding, add isBoss: true
5. Title: Short, punchy (e.g. "Algebra Blitz", "Bio Revision") - derive from topic
6. Explanation must teach, not just state the answer
7. Return JSON: { "title": "...", "items": [ { "question": "...", "options": ["A","B","C","D"], "correctAnswer": 0, "explanation": "...", "isBoss": false } ] }`

  const response = await callOpenRouterWithKey(apiKey, {
    model: 'openai/gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You output only valid JSON. No markdown, no explanation.' },
      { role: 'user', content: prompt },
    ],
    max_tokens: 2000,
    temperature: 0.5,
  })

  const content = response.choices?.[0]?.message?.content?.trim()
  if (!content) throw new Error('Empty AI response')

  let jsonContent = content
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (jsonMatch) jsonContent = jsonMatch[0]

  const parsed = JSON.parse(jsonContent) as { title?: string; items?: GameItem[] }
  const title = (parsed.title || learningObject.topic || 'Session Challenge').substring(0, 80)
  let items = Array.isArray(parsed.items) ? parsed.items : []

  if (items.length === 0) throw new Error('No questions generated')
  if (items.length > 8) items = items.slice(0, 8)
  if (items.length > 0 && !items[items.length - 1].isBoss) {
    items[items.length - 1] = { ...items[items.length - 1], isBoss: true }
  }

  return { title, items }
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin')

  try {
    const body: GenerateRequest = await request.json()
    const { sessionId } = body

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400, headers: corsHeaders(origin) }
      )
    }

    // Auth
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders(origin) }
      )
    }

    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Load session: verify access and get summary
    const { data: session, error: sessionError } = await serviceSupabase
      .from('individual_sessions')
      .select('id, tutor_id, learner_id, parent_id, recurring_session_id, session_summary')
      .eq('id', sessionId)
      .maybeSingle()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404, headers: corsHeaders(origin) }
      )
    }

    const isParticipant =
      session.tutor_id === user.id ||
      session.learner_id === user.id ||
      session.parent_id === user.id

    if (!isParticipant) {
      return NextResponse.json(
        { error: 'Not authorized to create challenge for this session' },
        { status: 403, headers: corsHeaders(origin) }
      )
    }

    if (session.recurring_session_id == null) {
      return NextResponse.json(
        { error: 'Challenge only available for recurring (normal) sessions, not trials' },
        { status: 400, headers: corsHeaders(origin) }
      )
    }

    const summary = (session.session_summary as string | null) ?? ''
    if (!summary.trim()) {
      return NextResponse.json(
        { error: 'Session summary not ready yet. Please try again later.' },
        { status: 400, headers: corsHeaders(origin) }
      )
    }

    // Check if game already exists for this session
    const { data: existingGame } = await serviceSupabase
      .from('skulmate_games')
      .select('id, title')
      .eq('individual_session_id', sessionId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (existingGame?.id) {
      const { data: gameData } = await serviceSupabase
        .from('skulmate_game_data')
        .select('game_content, metadata')
        .eq('game_id', existingGame.id)
        .maybeSingle()

      return NextResponse.json({
        success: true,
        game: {
          id: existingGame.id,
          title: existingGame.title ?? 'Session Challenge',
          gameType: 'quiz',
          items: (gameData?.game_content as GameItem[]) ?? [],
          metadata: gameData?.metadata ?? {},
        },
        fromCache: true,
      }, { headers: corsHeaders(origin) })
    }

    // Aggregate transcript
    let transcript = ''
    try {
      transcript = await aggregateTranscript(sessionId)
    } catch {
      // Proceed with summary only if transcript fails
    }

    const apiKey = getSkulMateApiKey()
    // Step 1: Structure content into learning object (PRD)
    const learningObject = await structureContent(summary, transcript, apiKey)
    // Step 2: Generate questions from structured object
    const { title, items } = await generateChallengeQuestions(learningObject, apiKey)

    // Determine child_id: if user is parent, use learner_id
    const childId = session.parent_id === user.id ? session.learner_id : null

    const { data: game, error: gameError } = await serviceSupabase
      .from('skulmate_games')
      .insert({
        user_id: user.id,
        child_id: childId,
        title,
        game_type: 'quiz',
        document_url: null,
        source_type: 'session',
        individual_session_id: sessionId,
      })
      .select()
      .maybeSingle()

    if (gameError || !game) {
      console.error('[skulMate from-session] Failed to save game:', gameError)
      return NextResponse.json(
        { error: 'Failed to save challenge' },
        { status: 500, headers: corsHeaders(origin) }
      )
    }

    const { error: dataError } = await serviceSupabase
      .from('skulmate_game_data')
      .insert({
        game_id: game.id,
        game_content: items,
        metadata: {
          source: 'session',
          individual_session_id: sessionId,
          generatedAt: new Date().toISOString(),
          totalItems: items.length,
          bossQuestion: items.some((i) => i.isBoss),
        },
      })

    if (dataError) {
      console.error('[skulMate from-session] Failed to save game data:', dataError)
    }

    return NextResponse.json({
      success: true,
      game: {
        id: game.id,
        title,
        gameType: 'quiz',
        items,
        metadata: {
          source: 'session',
          individual_session_id: sessionId,
          bossQuestion: items.some((i) => i.isBoss),
        },
      },
    }, { headers: corsHeaders(origin) })
  } catch (error: any) {
    console.error('[skulMate from-session] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate challenge' },
      { status: 500, headers: corsHeaders(origin) }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
