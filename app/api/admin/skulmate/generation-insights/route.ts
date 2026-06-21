import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin/require-admin'
import { getServiceSupabaseAdmin } from '@/lib/supabase-service'
import {
  formatMatchedTopicsForOps,
  getFrameworkLabel,
  type CurriculumLocale,
} from '@/lib/skulmate/curriculum-labels'

type GenerationContext = {
  curriculumAlignment?: {
    mode?: string
    confidence?: number
    frameworkId?: string
    matchedTopicIds?: string[]
  }
  extractionQuality?: {
    level?: string
    confidence?: number
    flags?: string[]
    charCount?: number
    wordCount?: number
  }
  extractionMethod?: string
  enrichmentMode?: string
}

function formatRow(
  row: Record<string, unknown>,
  locale: CurriculumLocale
) {
  const ctx = (row.generation_context || {}) as GenerationContext
  const alignment = ctx.curriculumAlignment
  const quality = ctx.extractionQuality
  const topicIds = alignment?.matchedTopicIds || []

  return {
    id: row.id,
    title: row.title,
    gameType: row.game_type,
    sourceType: row.source_type,
    createdAt: row.created_at,
    userId: row.user_id,
    enrichmentMode: ctx.enrichmentMode ?? 'background',
    curriculum: alignment
      ? {
          mode: alignment.mode ?? 'open',
          confidence: alignment.confidence ?? 0,
          frameworkId: alignment.frameworkId ?? null,
          frameworkLabel: alignment.frameworkId
            ? getFrameworkLabel(alignment.frameworkId, locale)
            : null,
          matchedTopics: formatMatchedTopicsForOps(topicIds, locale),
        }
      : null,
    extraction: quality
      ? {
          level: quality.level ?? 'high',
          confidence: quality.confidence ?? 1,
          flags: quality.flags ?? [],
          charCount: quality.charCount ?? 0,
          wordCount: quality.wordCount ?? 0,
          method: ctx.extractionMethod ?? null,
        }
      : ctx.extractionMethod
        ? { level: 'unknown', method: ctx.extractionMethod, flags: [] }
        : null,
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireAdminApi()
  if (auth.error) return auth.error

  const admin = getServiceSupabaseAdmin()
  if (!admin) {
    return NextResponse.json(
      { error: 'Server missing Supabase service role configuration' },
      { status: 500 }
    )
  }

  const { searchParams } = new URL(request.url)
  const limit = Math.min(100, Math.max(10, Number(searchParams.get('limit') || 50)))
  const qualityFilter = searchParams.get('quality')
  const alignmentFilter = searchParams.get('alignment')
  const locale = searchParams.get('locale') === 'fr' ? 'fr' : 'en'

  const { data, error } = await admin
    .from('skulmate_games')
    .select('id, title, game_type, source_type, created_at, user_id, generation_context')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  let rows = (data || []).map((row) => formatRow(row, locale))

  if (qualityFilter && qualityFilter !== 'all') {
    rows = rows.filter((r) => r.extraction?.level === qualityFilter)
  }
  if (alignmentFilter && alignmentFilter !== 'all') {
    rows = rows.filter((r) => r.curriculum?.mode === alignmentFilter)
  }

  const totals = {
    count: rows.length,
    lowExtraction: rows.filter((r) => r.extraction?.level === 'low').length,
    openCurriculum: rows.filter((r) => r.curriculum?.mode === 'open').length,
    schoolMatched: rows.filter((r) =>
      ['school_matched', 'school_soft'].includes(r.curriculum?.mode || '')
    ).length,
  }

  const format = searchParams.get('format')
  if (format === 'csv') {
    const header = [
      'id',
      'title',
      'source_type',
      'extraction_level',
      'curriculum_mode',
      'framework',
      'matched_topics',
      'created_at',
    ]
    const lines = rows.map((r) =>
      [
        r.id,
        `"${String(r.title).replace(/"/g, '""')}"`,
        r.sourceType,
        r.extraction?.level ?? '',
        r.curriculum?.mode ?? '',
        r.curriculum?.frameworkLabel ?? '',
        `"${(r.curriculum?.matchedTopics || []).join('; ').replace(/"/g, '""')}"`,
        r.createdAt,
      ].join(',')
    )
    const csv = [header.join(','), ...lines].join('\n')
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="skulmate-generation-insights.csv"',
      },
    })
  }

  return NextResponse.json({ rows, totals, locale })
}
