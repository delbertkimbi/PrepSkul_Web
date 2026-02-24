/**
 * skulMate Flashcard Explain API
 * Generates AI explanation + optional YouTube recommendations for a flashcard term/definition
 */

import { NextRequest, NextResponse } from 'next/server'
import { callOpenRouterWithKey } from '@/lib/ticha/openrouter'

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
}

interface ExplainRequest {
  term: string
  definition: string
}

interface ExplainAIResponse {
  explanation: string
  youtubeQuery: string | null
}

interface YouTubeSearchItem {
  id: { videoId: string }
  snippet: {
    title: string
    thumbnails: {
      default?: { url: string }
      medium?: { url: string }
      high?: { url: string }
    }
  }
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

async function searchYouTube(query: string): Promise<
  Array<{
    videoId: string
    title: string
    thumbnailUrl: string
  }>
> {
  const apiKey = process.env.YOUTUBE_DATA_API_KEY
  if (!apiKey) {
    console.warn('[skulMate explain] YOUTUBE_DATA_API_KEY not set, skipping video search')
    return []
  }

  const params = new URLSearchParams({
    part: 'snippet',
    q: query,
    type: 'video',
    maxResults: '3',
    key: apiKey,
  })

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?${params.toString()}`
  )
  if (!res.ok) {
    console.warn('[skulMate explain] YouTube API error:', res.status, await res.text())
    return []
  }

  const data = await res.json()
  const items = (data.items || []) as YouTubeSearchItem[]

  return items
    .filter((item) => item.id?.videoId)
    .map((item) => {
      const thumbnails = item.snippet?.thumbnails
      const thumbnailUrl =
        thumbnails?.high?.url ||
        thumbnails?.medium?.url ||
        thumbnails?.default?.url ||
        `https://img.youtube.com/vi/${item.id.videoId}/hqdefault.jpg`
      return {
        videoId: item.id.videoId,
        title: item.snippet?.title || 'Video',
        thumbnailUrl,
      }
    })
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin')
  const headers = { ...corsHeaders }
  if (origin) {
    headers['Access-Control-Allow-Origin'] = origin
  }

  try {
    const body: ExplainRequest = await request.json()
    const { term, definition } = body

    if (!term || typeof term !== 'string') {
      return NextResponse.json(
        { error: 'term is required and must be a string' },
        { status: 400, headers }
      )
    }

    const systemPrompt = `You are an educational assistant helping students learn flashcard terms.
Given a term and its definition, you will:
1. Generate a clear 2–3 paragraph explanation that deepens understanding.
2. Decide whether a short YouTube video would meaningfully help.

QUALITY RULES FOR youtubeQuery:
- Return a short YouTube search query (3–8 words) ONLY when a brief educational video would genuinely help (e.g. concepts, processes, how things work).
- Return null for: proper nouns only, trivial definitions, very short terms, or when text explanation is sufficient.
- Keep the query concise and educational (e.g. "photosynthesis explained for students").

Respond with JSON only, no markdown:
{
  "explanation": "Your 2-3 paragraph explanation here...",
  "youtubeQuery": "optional short search query" or null
}`

    const userPrompt = `Term: ${term}
Definition: ${definition}

Return a JSON object with "explanation" (2–3 paragraphs) and "youtubeQuery" (short search string or null).`

    const models = [
      'openai/gpt-4o-mini',
      'mistralai/mistral-7b-instruct',
      'meta-llama/llama-3.2-3b-instruct',
    ]

    const skulMateApiKey = getSkulMateApiKey()
    let response
    let lastError: Error | null = null

    for (const model of models) {
      try {
        response = await callOpenRouterWithKey(skulMateApiKey, {
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.5,
          max_tokens: 1500,
          response_format: { type: 'json_object' },
        })
        break
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err))
        continue
      }
    }

    if (!response?.choices?.[0]?.message?.content) {
      throw new Error(
        lastError?.message || 'Failed to get AI explanation'
      )
    }

    let parsed: ExplainAIResponse
    try {
      const raw = response.choices[0].message.content.trim()
      const jsonStr = raw.replace(/^```json\s*/i, '').replace(/\s*```$/, '')
      parsed = JSON.parse(jsonStr) as ExplainAIResponse
    } catch {
      throw new Error('Invalid AI response format')
    }

    const explanation = parsed.explanation || ''
    const youtubeQuery =
      parsed.youtubeQuery && String(parsed.youtubeQuery).trim().length > 0
        ? String(parsed.youtubeQuery).trim()
        : null

    let videos: Array<{ videoId: string; title: string; thumbnailUrl: string }> =
      []
    if (youtubeQuery) {
      videos = await searchYouTube(youtubeQuery)
    }

    return NextResponse.json(
      { explanation, videos: videos.length > 0 ? videos : undefined },
      { headers }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json(
      { error: message },
      { status: 500, headers: corsHeaders }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  })
}
