/**
 * Upload extraction QA — internal confidence scoring only.
 * Never blocks generation; flags stored in generation_context for ops.
 */

export type ExtractionQualityLevel = 'high' | 'medium' | 'low'

export type ExtractionQualityFlag =
  | 'short_text'
  | 'ocr_fallback'
  | 'visual_fallback'
  | 'high_ocr_retries'
  | 'low_lexical_diversity'
  | 'noisy_text'
  | 'sparse_entities'
  | 'entity_extraction_failed'
  | 'youtube_transcript_thin'

export type ExtractionQuality = {
  level: ExtractionQualityLevel
  confidence: number
  flags: ExtractionQualityFlag[]
  charCount: number
  wordCount: number
}

export type AssessExtractionQualityInput = {
  extractedText: string
  extractionMethod: string
  extractionMeta?: Record<string, unknown> | null
  sourceType: string
  entitiesExtracted?: number | null
  entityExtractionFailed?: boolean
}

function countWords(text: string): number {
  const trimmed = text.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).filter(Boolean).length
}

function lexicalDiversity(text: string): number {
  const words = text
    .toLowerCase()
    .match(/[a-z]{3,}/g)
  if (!words || words.length < 8) return 1
  const unique = new Set(words)
  return unique.size / words.length
}

function noiseRatio(text: string): number {
  const letters = (text.match(/[A-Za-z]/g) || []).length
  const digits = (text.match(/[0-9]/g) || []).length
  const meaningful = letters + digits
  if (meaningful === 0) return 1
  return 1 - meaningful / text.length
}

function minCharsForSource(sourceType: string): number {
  switch (sourceType) {
    case 'image':
      return 60
    case 'pdf':
    case 'docx':
      return 120
    case 'youtube':
      return 150
    case 'text':
      return 80
    default:
      return 100
  }
}

export function assessExtractionQuality(
  input: AssessExtractionQualityInput
): ExtractionQuality {
  const text = (input.extractedText || '').trim()
  const charCount = text.length
  const wordCount = countWords(text)
  const flags: ExtractionQualityFlag[] = []
  let confidence = 1

  const minChars = minCharsForSource(input.sourceType)
  if (charCount < minChars) {
    flags.push('short_text')
    confidence -= charCount < minChars * 0.5 ? 0.3 : 0.15
  }

  const method = input.extractionMethod || ''
  const meta = input.extractionMeta || {}

  if (method.includes('visual') || meta.mode === 'visual-fallback') {
    flags.push('visual_fallback')
    confidence -= 0.35
  } else if (method.startsWith('openrouter')) {
    flags.push('ocr_fallback')
    confidence -= 0.12
  }

  const variantsAttempted = Number(meta.variantsAttempted || 0)
  if (variantsAttempted >= 3) {
    flags.push('high_ocr_retries')
    confidence -= 0.1
  }

  if (charCount >= 200 && lexicalDiversity(text) < 0.28) {
    flags.push('low_lexical_diversity')
    confidence -= 0.15
  }

  if (charCount >= 80 && noiseRatio(text) > 0.45) {
    flags.push('noisy_text')
    confidence -= 0.2
  }

  if (input.entityExtractionFailed) {
    flags.push('entity_extraction_failed')
    confidence -= 0.08
  } else if (
    input.entitiesExtracted != null &&
    input.entitiesExtracted < 2 &&
    charCount >= 500
  ) {
    flags.push('sparse_entities')
    confidence -= 0.1
  }

  if (input.sourceType === 'youtube' && charCount < 220) {
    flags.push('youtube_transcript_thin')
    confidence -= 0.12
  }

  confidence = Math.max(0, Math.min(1, confidence))

  let level: ExtractionQualityLevel = 'high'
  if (confidence < 0.55) level = 'low'
  else if (confidence < 0.8) level = 'medium'

  return {
    level,
    confidence: Math.round(confidence * 100) / 100,
    flags,
    charCount,
    wordCount,
  }
}

/** Silent prompt guard — only when extraction may be unreliable. */
export function buildExtractionQualityPromptSection(
  quality: ExtractionQuality
): string {
  if (quality.level === 'high') return ''

  const caution =
    quality.level === 'low'
      ? 'Source text may be incomplete or noisy (OCR/visual fallback).'
      : 'Source text quality is moderate; some details may be missing.'

  return (
    '\n\nSOURCE QUALITY HINT (internal — do not mention to the learner):\n' +
    `- ${caution}\n` +
    '- Stay strictly faithful to phrases and facts present in the source.\n' +
    '- Prefer fewer, well-grounded items over inventing extra concepts.\n' +
    '- If a detail is unclear, skip it rather than guessing.\n'
  )
}
