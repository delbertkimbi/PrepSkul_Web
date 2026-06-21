/**
 * POST /api/skulmate/lesson-plan
 * Phase D1 — generate turn-by-turn lesson path and persist to skulmate_lessons.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { callOpenRouterWithKey } from '@/lib/ticha/openrouter'
import {
  buildLessonPlanPrompt,
  fallbackLessonPlan,
  normalizeLessonSteps,
  parseLessonPlanResponse,
  type LessonStep,
} from '@/lib/skulmate/lesson-plan'
import type { LearnerContextInput } from '@/lib/skulmate/learner-context'

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
}

type LessonPlanRequest = {
  topic?: string
  text?: string
  gameId?: string
  childId?: string
  locale?: string
  learnerContext?: LearnerContextInput | null
}

function getSkulMateApiKey(): string {
  const key =
    process.env.SKULMATE_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY
  if (!key) {
    throw new Error(
      'Missing SKULMATE_OPENROUTER_API_KEY or OPENROUTER_API_KEY environment variable'
    )
  }
  return key
}

function getServiceSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

async function loadGameContext(gameId: string): Promise<{
  topic: string
  text: string
} | null> {
  const admin = getServiceSupabaseAdmin()
  if (!admin) return null
  const { data } = await admin
    .from('skulmate_games')
    .select('title, items, source_text')
    .eq('id', gameId)
    .maybeSingle()
  if (!data) return null

  const title = String(data.title || 'Lesson').trim()
  const sourceText = data.source_text as string | null
  if (sourceText?.trim()) {
    return { topic: title, text: sourceText.trim() }
  }

  const items = (data.items as Array<Record<string, unknown>>) || []
  const lines = items
    .slice(0, 20)
    .map((item) => {
      const term = item.term ?? item.question
      const def = item.definition ?? item.answer ?? item.correctAnswer
      if (term && def) return `${term}: ${def}`
      return null
    })
    .filter(Boolean)
    .join('\n')

  return { topic: title, text: lines || title }
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin')
  const headers = { ...corsHeaders }
  if (origin) headers['Access-Control-Allow-Origin'] = origin

  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers })
    }

    const body = (await request.json()) as LessonPlanRequest
    const locale = body.locale === 'fr' ? 'fr' : 'en'

    let topic = body.topic?.trim() || ''
    let sourceText = body.text?.trim() || ''
    const sourceGameId = body.gameId?.trim() || null

    if (sourceGameId) {
      const gameCtx = await loadGameContext(sourceGameId)
      if (gameCtx) {
        if (!topic) topic = gameCtx.topic
        if (!sourceText) sourceText = gameCtx.text
      }
    }

    if (!topic && sourceText) {
      topic = sourceText.split('\n')[0].slice(0, 80).trim() || 'Lesson'
    }

    if (!topic) {
      return NextResponse.json(
        { error: 'topic, text, or gameId is required' },
        { status: 400, headers }
      )
    }

    let planSteps: LessonStep[]
    let resolvedTopic = topic

    try {
      const apiKey = getSkulMateApiKey()
      const prompt = buildLessonPlanPrompt({
        topic,
        sourceText,
        locale,
        learnerContext: body.learnerContext,
      })

      const response = await callOpenRouterWithKey(apiKey, {
        model: process.env.SKULMATE_LESSON_MODEL || 'google/gemini-2.5-flash-preview',
        messages: [
          {
            role: 'system',
            content:
              'You output valid JSON only. Design concise lesson paths for teen learners.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 2000,
        temperature: 0.4,
        response_format: { type: 'json_object' },
      })

      const content = response.choices[0]?.message?.content || '{}'
      const parsed = parseLessonPlanResponse(content)
      resolvedTopic = parsed.topic || topic
      planSteps = normalizeLessonSteps(parsed.steps)
    } catch (genErr) {
      console.warn('[lesson-plan] AI fallback:', genErr)
      const fallback = fallbackLessonPlan(topic, locale)
      resolvedTopic = fallback.topic
      planSteps = normalizeLessonSteps(fallback.steps)
    }

    const admin = getServiceSupabaseAdmin()
    if (!admin) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500, headers }
      )
    }

    const now = new Date().toISOString()
    const { data: inserted, error } = await admin
      .from('skulmate_lessons')
      .insert({
        user_id: user.id,
        child_id: body.childId || null,
        source_game_id: sourceGameId,
        topic: resolvedTopic,
        steps: planSteps,
        current_step: 0,
        created_at: now,
        updated_at: now,
      })
      .select('id, topic, steps, current_step, source_game_id, child_id, created_at')
      .single()

    if (error) {
      console.error('[lesson-plan] insert error:', error)
      return NextResponse.json(
        { error: 'Failed to save lesson plan' },
        { status: 500, headers }
      )
    }

    return NextResponse.json(
      {
        lesson: inserted,
      },
      { headers }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500, headers })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  })
}
