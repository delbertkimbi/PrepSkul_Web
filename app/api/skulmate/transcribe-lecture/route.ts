/**
 * POST /api/skulmate/transcribe-lecture
 * Transcribe uploaded lecture audio via Deepgram and persist transcript text.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { DeepgramClient } from '@/lib/services/transcription/deepgram.client'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const MIN_TRANSCRIPT_LENGTH = 50

interface TranscribeRequest {
  audioUrl: string
  userId?: string
  childId?: string
  title?: string
  durationSeconds?: number
  language?: string
}

function corsHeaders(origin: string | null): Record<string, string> {
  return {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Origin': origin || '*',
    ...(origin && { 'Access-Control-Allow-Credentials': 'true' }),
  }
}

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin')
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) })
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin')
  const headers = corsHeaders(origin)

  try {
    const body = (await request.json()) as TranscribeRequest
    const {
      audioUrl,
      userId,
      childId,
      title,
      durationSeconds,
      language,
    } = body

    if (!audioUrl?.trim()) {
      return NextResponse.json(
        { error: 'audioUrl is required' },
        { status: 400, headers }
      )
    }

    let sessionUserId: string | undefined
    try {
      const supabase = await createServerSupabaseClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      sessionUserId = user?.id
    } catch {
      // Continue without cookie session (mobile bearer token flows)
    }

    const finalUserId = userId || sessionUserId
    if (!finalUserId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401, headers }
      )
    }

    const deepgram = new DeepgramClient()
    const transcript = await deepgram.transcribeFromUrl(audioUrl, {
      language: language || undefined,
    })

    const text = (transcript.text || '').trim()
    if (text.length < MIN_TRANSCRIPT_LENGTH) {
      return NextResponse.json(
        {
          error:
            'Could not extract enough speech from the recording. Try speaking closer to the mic or record a longer lecture.',
          errorCode: 'TRANSCRIPT_TOO_SHORT',
        },
        { status: 422, headers }
      )
    }

    const admin = getAdminSupabase()
    const { data: row, error: insertError } = await admin
      .from('skulmate_lecture_transcripts')
      .insert({
        user_id: finalUserId,
        child_id: childId || null,
        title: title?.trim() || 'Recorded lecture',
        transcript_text: text,
        duration_seconds:
          durationSeconds ??
          (Math.round(transcript.duration || 0) || null),
        language: transcript.language || language || 'en',
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('[transcribe-lecture] DB insert failed:', insertError)
      return NextResponse.json(
        { error: 'Failed to save transcript' },
        { status: 500, headers }
      )
    }

    return NextResponse.json(
      {
        transcriptId: row.id,
        text,
        duration: transcript.duration,
        language: transcript.language,
      },
      { status: 200, headers }
    )
  } catch (error: unknown) {
    console.error('[transcribe-lecture] Error:', error)
    const message =
      error instanceof Error ? error.message : 'Transcription failed'
    return NextResponse.json(
      { error: message, errorCode: 'TRANSCRIPTION_FAILED' },
      { status: 500, headers }
    )
  }
}
