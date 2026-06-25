/**
 * Fetch public YouTube captions/transcript for SkulMate intake.
 */

const USER_AGENT =
  'Mozilla/5.0 (compatible; PrepSkul-SkulMate/1.0; +https://prepskul.com)'

export type YoutubeTranscriptErrorCode =
  | 'YOUTUBE_NO_CAPTIONS'
  | 'YOUTUBE_TRANSCRIPT_UNAVAILABLE'
  | 'YOUTUBE_URL_INVALID'

export class YoutubeTranscriptError extends Error {
  readonly errorCode: YoutubeTranscriptErrorCode

  constructor(message: string, errorCode: YoutubeTranscriptErrorCode) {
    super(message)
    this.name = 'YoutubeTranscriptError'
    this.errorCode = errorCode
  }
}

export function isYoutubeTranscriptError(err: unknown): err is YoutubeTranscriptError {
  return err instanceof YoutubeTranscriptError
}

export function parseYoutubeVideoId(rawUrl: string): string | null {
  const trimmed = rawUrl.trim()
  if (!trimmed) return null

  try {
    const url = new URL(trimmed)
    const host = url.hostname.replace(/^www\./, '')

    if (host === 'youtu.be') {
      const id = url.pathname.replace(/^\//, '').split('/')[0]
      return id || null
    }

    if (host.includes('youtube.com')) {
      const v = url.searchParams.get('v')
      if (v) return v
      const shorts = url.pathname.match(/\/shorts\/([^/?]+)/)
      if (shorts?.[1]) return shorts[1]
      const embed = url.pathname.match(/\/embed\/([^/?]+)/)
      if (embed?.[1]) return embed[1]
    }
  } catch {
    // fall through
  }

  const loose = trimmed.match(
    /(?:v=|youtu\.be\/|shorts\/|embed\/)([A-Za-z0-9_-]{11})/
  )
  return loose?.[1] ?? null
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

function parseTimedTextXml(xml: string): string {
  const chunks: string[] = []
  const regex = /<text[^>]*>([\s\S]*?)<\/text>/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(xml)) !== null) {
    const raw = match[1]
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    if (raw) chunks.push(decodeHtmlEntities(raw))
  }
  return chunks.join(' ').replace(/\s+/g, ' ').trim()
}

async function fetchTimedText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
  })
  if (!response.ok) {
    throw new Error(`Transcript fetch failed (${response.status})`)
  }
  const body = await response.text()
  const parsed = parseTimedTextXml(body)
  if (parsed.length >= 50) return parsed
  throw new Error('Transcript too short')
}

function extractCaptionTrackUrl(html: string): string | null {
  const patterns = [
    /"captionTracks":(\[[\s\S]*?\])/,
    /"captions":\{[\s\S]*?"captionTracks":(\[[\s\S]*?\])/,
  ]

  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (!match?.[1]) continue
    try {
      const tracks = JSON.parse(match[1]) as Array<{
        baseUrl?: string
        languageCode?: string
        kind?: string
      }>
      if (!Array.isArray(tracks) || tracks.length === 0) continue

      const preferred =
        tracks.find((t) => t.languageCode?.startsWith('en') && t.kind !== 'asr') ??
        tracks.find((t) => t.languageCode?.startsWith('en')) ??
        tracks.find((t) => t.kind !== 'asr') ??
        tracks[0]

      if (preferred?.baseUrl) {
        return preferred.baseUrl.replace(/\\u0026/g, '&')
      }
    } catch {
      continue
    }
  }

  return null
}

/**
 * Returns transcript text for a public YouTube video URL.
 */
export async function fetchYoutubeTranscript(youtubeUrl: string): Promise<string> {
  const videoId = parseYoutubeVideoId(youtubeUrl)
  if (!videoId) {
    throw new YoutubeTranscriptError(
      'Invalid YouTube URL',
      'YOUTUBE_URL_INVALID'
    )
  }

  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`
  let html: string
  try {
    const watchResponse = await fetch(watchUrl, {
      headers: { 'User-Agent': USER_AGENT },
    })

    if (!watchResponse.ok) {
      throw new YoutubeTranscriptError(
        'Could not load YouTube video page',
        'YOUTUBE_TRANSCRIPT_UNAVAILABLE'
      )
    }

    html = await watchResponse.text()
  } catch (error) {
    if (isYoutubeTranscriptError(error)) throw error
    throw new YoutubeTranscriptError(
      'Could not reach YouTube to fetch captions',
      'YOUTUBE_TRANSCRIPT_UNAVAILABLE'
    )
  }

  const captionUrl = extractCaptionTrackUrl(html)
  const hadCaptionTracks = captionUrl != null

  if (captionUrl) {
    try {
      return await fetchTimedText(captionUrl)
    } catch {
      // try fallback endpoint below
    }
  }

  const fallbackUrls = [
    `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en`,
    `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&kind=asr`,
    `https://www.youtube.com/api/timedtext?v=${videoId}&lang=fr`,
  ]

  for (const url of fallbackUrls) {
    try {
      return await fetchTimedText(url)
    } catch {
      continue
    }
  }

  if (!hadCaptionTracks) {
    throw new YoutubeTranscriptError(
      'This video has no captions. Try a video with subtitles turned on, or paste notes manually.',
      'YOUTUBE_NO_CAPTIONS'
    )
  }

  throw new YoutubeTranscriptError(
    'Transcript could not be loaded right now. Try again or paste notes manually.',
    'YOUTUBE_TRANSCRIPT_UNAVAILABLE'
  )
}
