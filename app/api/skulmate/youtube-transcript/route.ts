/**
 * Fetch YouTube transcript for SkulMate intake (used before /generate).
 */

import { NextRequest, NextResponse } from 'next/server'
import { fetchYoutubeTranscript } from '@/lib/skulmate/youtube-transcript'

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin')
  const headers = { ...corsHeaders }
  if (origin) headers['Access-Control-Allow-Origin'] = origin

  try {
    const body = await request.json()
    const youtubeUrl = body?.youtubeUrl as string | undefined
    if (!youtubeUrl || typeof youtubeUrl !== 'string') {
      return NextResponse.json(
        { error: 'youtubeUrl is required', errorCode: 'YOUTUBE_URL_REQUIRED' },
        { status: 400, headers }
      )
    }

    const transcript = await fetchYoutubeTranscript(youtubeUrl)
    if (transcript.trim().length < 50) {
      return NextResponse.json(
        {
          error:
            'Transcript was too short. Try a video with captions or paste notes manually.',
          errorCode: 'YOUTUBE_TRANSCRIPT_TOO_SHORT',
        },
        { status: 422, headers }
      )
    }

    return NextResponse.json({ transcript, youtubeUrl }, { headers })
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : 'No transcript available for this video.'
    return NextResponse.json(
      {
        error: message,
        errorCode: 'YOUTUBE_TRANSCRIPT_UNAVAILABLE',
      },
      { status: 422, headers }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}
