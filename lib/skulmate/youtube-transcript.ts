/**
 * Fetch public YouTube captions/transcript for SkulMate intake.
 * Primary path: YouTube InnerTube player API (ANDROID/IOS clients).
 * Legacy fallback: captionTracks embedded in watch-page HTML.
 */

const USER_AGENT =
  'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36'

const INNERTUBE_CLIENTS = [
  { clientName: 'IOS', clientVersion: '20.10.4' },
  { clientName: 'ANDROID', clientVersion: '20.10.38' },
  { clientName: 'WEB', clientVersion: '2.20250218.01.00' },
] as const

export type YoutubeTranscriptErrorCode =
  | 'YOUTUBE_NO_CAPTIONS'
  | 'YOUTUBE_TRANSCRIPT_UNAVAILABLE'
  | 'YOUTUBE_URL_INVALID'

export type YoutubeTranscriptSource = 'captions' | 'metadata'

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
    .replace(/\\n/g, '\n')
    .replace(/\\u0026/g, '&')
    .replace(/&nbsp;/g, ' ')
}

function parseTimedTextXml(xml: string): string {
  // YouTube timedtext format 3 uses <p>/<s> nodes instead of legacy <text>.
  if (xml.includes('format="3"') || xml.includes('<p ')) {
    const chunks: string[] = []
    const paragraphRegex = /<p\b[^>]*>([\s\S]*?)<\/p>/g
    let paragraphMatch: RegExpExecArray | null
    while ((paragraphMatch = paragraphRegex.exec(xml)) !== null) {
      const inner = paragraphMatch[1]
      let line = ''
      const segmentRegex = /<s[^>]*>([\s\S]*?)<\/s>/g
      let segmentMatch: RegExpExecArray | null
      while ((segmentMatch = segmentRegex.exec(inner)) !== null) {
        line += decodeHtmlEntities(segmentMatch[1])
      }
      if (!line.trim()) {
        line = inner.replace(/<[^>]+>/g, ' ')
      }
      const cleaned = line.replace(/\s+/g, ' ').trim()
      if (cleaned && !/^\[(music|applause)\]$/i.test(cleaned)) {
        chunks.push(cleaned)
      }
    }
    const joined = chunks.join(' ').replace(/\s+/g, ' ').trim()
    if (joined.length >= 50) return joined
  }

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

function parseTimedTextJson3(body: string): string {
  try {
    const data = JSON.parse(body) as {
      events?: Array<{ segs?: Array<{ utf8?: string }> }>
    }
    const chunks: string[] = []
    for (const event of data.events ?? []) {
      for (const seg of event.segs ?? []) {
        const text = seg.utf8?.trim()
        if (text && text !== '\n') chunks.push(text)
      }
    }
    return chunks.join(' ').replace(/\s+/g, ' ').trim()
  } catch {
    return ''
  }
}

type CaptionTrack = {
  baseUrl?: string
  languageCode?: string
  kind?: string
}

function pickPreferredCaptionTrack(tracks: CaptionTrack[]): CaptionTrack | null {
  if (!Array.isArray(tracks) || tracks.length === 0) return null
  return (
    tracks.find((t) => t.languageCode?.startsWith('en') && t.kind === 'asr') ??
    tracks.find((t) => t.languageCode?.startsWith('en') && t.kind !== 'asr') ??
    tracks.find((t) => t.languageCode?.startsWith('en')) ??
    tracks.find((t) => t.languageCode?.startsWith('fr') && t.kind === 'asr') ??
    tracks.find((t) => t.languageCode?.startsWith('fr')) ??
    tracks.find((t) => t.kind === 'asr') ??
    tracks[0] ??
    null
  )
}

function normalizeCaptionTrackUrl(baseUrl: string): string {
  const decoded = baseUrl.replace(/\\u0026/g, '&')
  if (decoded.includes('fmt=json3')) return decoded
  const separator = decoded.includes('?') ? '&' : '?'
  return `${decoded}${separator}fmt=json3`
}

async function fetchTimedText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Referer: 'https://www.youtube.com/',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  })
  if (!response.ok) {
    throw new Error(`Transcript fetch failed (${response.status})`)
  }
  const body = await response.text()
  if (!body || body.trim().length === 0) {
    throw new Error('Transcript empty')
  }

  const trimmed = body.trim()
  if (trimmed.startsWith('{')) {
    const parsed = parseTimedTextJson3(trimmed)
    if (parsed.length >= 50) return parsed
  }

  const parsed = parseTimedTextXml(body)
  if (parsed.length >= 50) return parsed
  throw new Error('Transcript too short')
}

function extractInnertubeApiKey(html: string): string | null {
  const match = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/)
  return match?.[1] ?? null
}

async function fetchInnertubeCaptionTracks(
  videoId: string,
  apiKey: string
): Promise<CaptionTrack[]> {
  const endpoint = `https://www.youtube.com/youtubei/v1/player?key=${apiKey}`

  for (const client of INNERTUBE_CLIENTS) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': USER_AGENT,
          'Accept-Language': 'en-US,en;q=0.9',
        },
        body: JSON.stringify({
          context: { client },
          videoId,
        }),
      })
      if (!response.ok) continue

      const data = (await response.json()) as {
        captions?: {
          playerCaptionsTracklistRenderer?: {
            captionTracks?: CaptionTrack[]
          }
        }
      }
      const tracks =
        data.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? []
      if (tracks.length > 0) return tracks
    } catch {
      continue
    }
  }

  return []
}

async function fetchCaptionsFromTracks(
  tracks: CaptionTrack[]
): Promise<string | null> {
  const preferred = pickPreferredCaptionTrack(tracks)
  if (!preferred?.baseUrl) return null

  const candidates = [
    normalizeCaptionTrackUrl(preferred.baseUrl),
    preferred.baseUrl.replace(/\\u0026/g, '&'),
  ]

  for (const url of candidates) {
    try {
      const text = await fetchTimedText(url)
      if (text.length >= 50) return text
    } catch {
      continue
    }
  }

  return null
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
      const tracks = JSON.parse(match[1]) as CaptionTrack[]
      const preferred = pickPreferredCaptionTrack(tracks)
      if (preferred?.baseUrl) {
        return preferred.baseUrl.replace(/\\u0026/g, '&')
      }
    } catch {
      continue
    }
  }

  return null
}

/** Extract title + description from a YouTube watch page when captions are blocked. */
export function extractYoutubeMetadataFromHtml(html: string): {
  title: string
  description: string
} {
  let title = ''
  let description = ''

  const titleMatch = html.match(/"title":"([^"]+)"/)
  if (titleMatch?.[1]) {
    title = decodeHtmlEntities(titleMatch[1])
      .replace(/\s*-\s*YouTube\s*$/i, '')
      .trim()
  }

  const descMatch = html.match(/"shortDescription":"((?:\\.|[^"\\])*)"/)
  if (descMatch?.[1]) {
    description = decodeHtmlEntities(descMatch[1]).trim()
  }

  if (!description) {
    const metaMatch = html.match(
      /<meta\s+name="description"\s+content="([^"]*)"/i
    )
    if (metaMatch?.[1]) {
      description = decodeHtmlEntities(metaMatch[1]).trim()
    }
  }

  return { title, description }
}

export function buildYoutubeMetadataStudyText(metadata: {
  title: string
  description: string
}): string {
  const parts: string[] = []
  if (metadata.title) parts.push(`Video: ${metadata.title}`)
  if (metadata.description) parts.push(metadata.description)
  return parts.join('\n\n').replace(/\s+/g, ' ').trim()
}

/**
 * Returns transcript text for a public YouTube video URL.
 * Uses real captions when available; metadata fallback is opt-in only.
 */
export async function fetchYoutubeTranscript(
  youtubeUrl: string,
  options?: { allowMetadataFallback?: boolean }
): Promise<string> {
  const result = await fetchYoutubeTranscriptWithMeta(youtubeUrl, options)
  return result.text
}

export async function fetchYoutubeTranscriptWithMeta(
  youtubeUrl: string,
  options?: { allowMetadataFallback?: boolean }
): Promise<{ text: string; source: YoutubeTranscriptSource }> {
  const allowMetadataFallback = options?.allowMetadataFallback ?? false
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
      headers: {
        'User-Agent': USER_AGENT,
        'Accept-Language': 'en-US,en;q=0.9',
      },
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

  const apiKey = extractInnertubeApiKey(html)
  if (apiKey) {
    const innertubeTracks = await fetchInnertubeCaptionTracks(videoId, apiKey)
    const innertubeText = await fetchCaptionsFromTracks(innertubeTracks)
    if (innertubeText) {
      console.log(
        `[skulMate] YouTube InnerTube captions for ${videoId} (${innertubeText.length} chars)`
      )
      return { text: innertubeText, source: 'captions' }
    }
  }

  const captionUrl = extractCaptionTrackUrl(html)
  const captionCandidates = [
    captionUrl ? normalizeCaptionTrackUrl(captionUrl) : null,
    captionUrl,
    `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&kind=asr&fmt=json3`,
    `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&kind=asr`,
    `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en`,
    `https://www.youtube.com/api/timedtext?v=${videoId}&lang=fr&fmt=json3`,
  ].filter((u): u is string => Boolean(u))

  for (const url of captionCandidates) {
    try {
      const text = await fetchTimedText(url)
      return { text, source: 'captions' }
    } catch {
      continue
    }
  }

  if (allowMetadataFallback) {
    const metadata = extractYoutubeMetadataFromHtml(html)
    const metadataText = buildYoutubeMetadataStudyText(metadata)
    if (metadataText.length >= 50) {
      console.warn(
        `[skulMate] YouTube captions unavailable for ${videoId}; using title/description fallback (${metadataText.length} chars)`
      )
      return { text: metadataText, source: 'metadata' }
    }
  }

  throw new YoutubeTranscriptError(
    'Could not read captions from this video. Use a video with subtitles/CC turned on, or paste notes manually.',
    captionUrl ? 'YOUTUBE_TRANSCRIPT_UNAVAILABLE' : 'YOUTUBE_NO_CAPTIONS'
  )
}
