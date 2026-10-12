import { downloadOwnedUpload } from './owned-upload'
import { assertOwnedChild } from './auth'
import { getServiceSupabaseAdmin } from './billing'
import { chunkText } from './chunk'
import { embedTexts } from './embed'
import { extractFile } from './extract'
import { fetchYoutubeTranscriptWithMeta } from './youtube-transcript'

export type IngestInput = {
  userId: string
  childId?: string | null
  sessionId?: string | null
  sourceType: 'text' | 'image' | 'pdf' | 'youtube' | 'lecture' | 'topic' | 'from_class'
  text?: string
  fileUrl?: string
  fileUrls?: string[]
  youtubeUrl?: string
  title?: string
}

export type IngestResult = {
  artifactId: string
  chunkCount: number
  textPreview: string
}

export async function ingestArtifact(input: IngestInput): Promise<IngestResult> {
  const admin = getServiceSupabaseAdmin()
  if (!admin) throw new Error('Memory store unavailable')

  await assertOwnedChild(input.userId, input.childId)
  const extracted = await extractSource(input)
  const { data: artifact, error } = await admin
    .from('skulmate_artifacts')
    .insert({
      user_id: input.userId,
      child_id: input.childId ?? null,
      session_id: input.sessionId ?? null,
      source_type: input.sourceType,
      title: input.title || extracted.title || 'Notes',
      raw_text: extracted.text,
      file_url: input.fileUrl || input.youtubeUrl || null,
      metadata: extracted.metadata || {},
    })
    .select('id')
    .single()

  if (error || !artifact) {
    throw new Error(error?.message || 'Failed to store artifact')
  }

  const chunks = chunkText(extracted.text)
  if (chunks.length) {
    let embeddings: number[][] = []
    try {
      embeddings = await embedTexts(chunks.map((c) => c.content))
    } catch {
      embeddings = []
    }

    const rows = chunks.map((chunk, i) => ({
      artifact_id: artifact.id,
      user_id: input.userId,
      child_id: input.childId ?? null,
      content: chunk.content,
      token_count: chunk.tokenCount,
      embedding: embeddings[i] ? `[${embeddings[i].join(',')}]` : null,
    }))
    await admin.from('skulmate_chunks').insert(rows)
  }

  return {
    artifactId: artifact.id as string,
    chunkCount: chunks.length,
    textPreview: extracted.text.slice(0, 400),
  }
}

async function extractSource(input: IngestInput): Promise<{
  text: string
  title?: string
  metadata?: Record<string, unknown>
}> {
  if (input.youtubeUrl) {
    const yt = await fetchYoutubeTranscriptWithMeta(input.youtubeUrl)
    return {
      text: yt.text,
      title: 'YouTube',
      metadata: { youtubeUrl: input.youtubeUrl, source: yt.source },
    }
  }

  const urls = [
    ...(input.fileUrl ? [input.fileUrl] : []),
    ...((input.fileUrls || []).filter(Boolean) as string[]),
  ]
  if (urls.length) {
    const parts: string[] = []
    for (const url of urls.slice(0, 8)) {
      const buffer = await downloadOwnedUpload(url, input.userId)
      const extracted = await extractFile(buffer, undefined, guessName(url), {
        imageSourceUrl: url,
      })
      if (extracted.text) parts.push(extracted.text)
    }
    return {
      text: parts.join('\n\n'),
      metadata: { fileCount: urls.length },
    }
  }

  const text = (input.text || '').trim()
  if (!text) throw new Error('Nothing to ingest')
  return { text, title: input.title }
}

function guessName(url: string): string {
  try {
    const path = new URL(url).pathname
    const last = path.split('/').pop()
    return last && last.includes('.') ? last : 'notes.pdf'
  } catch {
    return 'notes.pdf'
  }
}
