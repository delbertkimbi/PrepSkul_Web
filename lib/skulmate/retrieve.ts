import { getServiceSupabaseAdmin } from './billing'
import { embedTexts } from './embed'
import { retrieveCurriculum } from './curriculum-corpus'
import { HARVEST_PACKS } from './harvest-packs'
import { flattenHarvestCorpus } from './harvest-schema'

export type RetrievedChunk = {
  id: string
  artifactId: string
  content: string
  conceptId?: string | null
  similarity?: number
}

type ChunkRow = {
  id: string
  artifact_id: string
  content: string
  concept_id?: string | null
  embedding?: number[] | string | null
}

/**
 * Retrieve notes for this student.
 * 1. Embed the query
 * 2. pgvector RPC (HNSW) — fast path
 * 3. In-process cosine on a small recent window — if RPC is missing
 * 4. Keyword ilike — if embeddings are down
 */
export async function retrieveChunks(params: {
  userId: string
  childId?: string | null
  query: string
  limit?: number
}): Promise<RetrievedChunk[]> {
  const admin = getServiceSupabaseAdmin()
  if (!admin) return []
  const limit = Math.min(params.limit ?? 6, 12)

  try {
    const [queryVec] = await embedTexts([params.query.slice(0, 4000)])
    const rpcHits = await matchViaRpc({
      admin,
      queryVec,
      userId: params.userId,
      childId: params.childId,
      limit,
    })
    if (rpcHits?.length) return rpcHits

    return matchInProcess({
      admin,
      queryVec,
      query: params.query,
      userId: params.userId,
      childId: params.childId,
      limit,
    })
  } catch {
    return keywordFallback(params)
  }
}

async function matchViaRpc(params: {
  admin: NonNullable<ReturnType<typeof getServiceSupabaseAdmin>>
  queryVec: number[]
  userId: string
  childId?: string | null
  limit: number
}): Promise<RetrievedChunk[] | null> {
  const { data, error } = await params.admin.rpc('match_skulmate_chunks', {
    query_embedding: params.queryVec,
    match_user_id: params.userId,
    match_child_id: params.childId ?? null,
    match_count: params.limit,
    match_threshold: 0.18,
  })
  if (error || !data?.length) return null
  return (data as Array<{
    id: string
    artifact_id: string
    content: string
    concept_id?: string | null
    similarity?: number
  }>).map((row) => ({
    id: row.id,
    artifactId: row.artifact_id,
    content: row.content,
    conceptId: row.concept_id,
    similarity: row.similarity,
  }))
}

async function matchInProcess(params: {
  admin: NonNullable<ReturnType<typeof getServiceSupabaseAdmin>>
  queryVec: number[]
  query: string
  userId: string
  childId?: string | null
  limit: number
}): Promise<RetrievedChunk[]> {
  let query = params.admin
    .from('skulmate_chunks')
    .select('id, artifact_id, content, concept_id, embedding')
    .eq('user_id', params.userId)
    .order('created_at', { ascending: false })
    .limit(24)

  query = params.childId
    ? query.eq('child_id', params.childId)
    : query.is('child_id', null)

  const { data, error } = await query
  if (error || !data?.length) {
    return keywordFallback({
      userId: params.userId,
      childId: params.childId,
      query: params.query,
      limit: params.limit,
    })
  }

  return rankChunksInProcess(
    data as ChunkRow[],
    params.queryVec,
    params.query,
    params.limit
  )
}

export function rankChunksInProcess(
  rows: ChunkRow[],
  queryVec: number[],
  query: string,
  limit: number
): RetrievedChunk[] {
  return rows
    .map((row) => {
      const vec = parseEmbedding(row.embedding)
      return {
        id: row.id,
        artifactId: row.artifact_id,
        content: row.content,
        conceptId: row.concept_id,
        similarity: vec ? cosine(queryVec, vec) : lexicalScore(query, row.content),
      }
    })
    .sort((a, b) => (b.similarity || 0) - (a.similarity || 0))
    .slice(0, limit)
}

async function keywordFallback(params: {
  userId: string
  childId?: string | null
  query: string
  limit?: number
}): Promise<RetrievedChunk[]> {
  const admin = getServiceSupabaseAdmin()
  if (!admin) return []
  const needle = params.query.replace(/[%_]/g, '').slice(0, 80)
  if (!needle.trim()) return []
  let query = admin
    .from('skulmate_chunks')
    .select('id, artifact_id, content, concept_id')
    .eq('user_id', params.userId)
    .ilike('content', `%${needle}%`)
    .limit(params.limit ?? 6)
  query = params.childId
    ? query.eq('child_id', params.childId)
    : query.is('child_id', null)
  const { data } = await query
  return (data || []).map((row) => ({
    id: row.id as string,
    artifactId: row.artifact_id as string,
    content: row.content as string,
    conceptId: row.concept_id as string | null,
  }))
}

export function parseEmbedding(raw: unknown): number[] | null {
  if (Array.isArray(raw)) return raw.map(Number)
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed.map(Number) : null
    } catch {
      return null
    }
  }
  return null
}

export function cosine(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length)
  if (!n) return 0
  let dot = 0
  let na = 0
  let nb = 0
  for (let i = 0; i < n; i++) {
    dot += a[i] * b[i]
    na += a[i] * a[i]
    nb += b[i] * b[i]
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb)
  return denom ? dot / denom : 0
}

export function lexicalScore(query: string, content: string): number {
  const terms = query.toLowerCase().split(/\W+/).filter((t) => t.length > 2)
  if (!terms.length) return 0
  const hay = content.toLowerCase()
  const hits = terms.filter((t) => hay.includes(t)).length
  return hits / terms.length
}

/**
 * Curriculum first. Optional uploads from pgvector are extra, never a gate.
 */
export async function retrieveTeachingContext(params: {
  query: string
  subjectId?: string | null
  userId?: string
  childId?: string | null
  extraNotes?: string
  limit?: number
}): Promise<RetrievedChunk[]> {
  const curriculum = retrieveCurriculum({
    query: params.query,
    subjectId: params.subjectId,
    limit: 4,
  })
  const harvest: RetrievedChunk[] = HARVEST_PACKS.flatMap((pack, packIndex) =>
    flattenHarvestCorpus(pack).map((content, i) => ({
      id: `harvest:${pack.regionId}:${packIndex}:${i}`,
      artifactId: 'harvest',
      content: content.slice(0, 1600),
      conceptId: pack.systemId || pack.regionId,
      similarity: lexicalScore(params.query, content),
    }))
  )
    .filter((chunk) => (chunk.similarity || 0) > 0.12)
    .sort((a, b) => (b.similarity || 0) - (a.similarity || 0))
    .slice(0, 3)
  const extras: RetrievedChunk[] = []
  if (params.extraNotes?.trim()) {
    extras.push({
      id: 'upload:notes',
      artifactId: 'upload',
      content: params.extraNotes.replace(/\s+/g, ' ').trim().slice(0, 1600),
      conceptId: null,
      similarity: 0.5,
    })
  }
  if (params.userId) {
    try {
      const hits = await retrieveChunks({
        userId: params.userId,
        childId: params.childId,
        query: params.query,
        limit: 4,
      })
      extras.push(...hits)
    } catch {
      /* curriculum still teaches */
    }
  }
  const seen = new Set<string>()
  const merged: RetrievedChunk[] = []
  for (const chunk of [...curriculum, ...harvest, ...extras]) {
    const key = chunk.id
    if (seen.has(key)) continue
    seen.add(key)
    merged.push(chunk)
    if (merged.length >= (params.limit ?? 6)) break
  }
  return merged
}
