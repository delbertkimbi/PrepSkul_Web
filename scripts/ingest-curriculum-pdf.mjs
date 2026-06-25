#!/usr/bin/env node
/**
 * Draft MINESEC / GCE curriculum node from a local PDF (ops only).
 *
 * Usage:
 *   node scripts/ingest-curriculum-pdf.mjs \
 *     --pdf ./downloads/gce-ol-chemistry.pdf \
 *     --framework cm_gce_ol \
 *     --subject chemistry \
 *     --topic-id gce_ol_chem_custom_01 \
 *     --title-en "Topic title" \
 *     --title-fr "Titre du sujet"
 *
 * Output: data/curriculum/ingest/drafts/<topic-id>.json
 * Review manually, then merge keywords/objectives into seed-nodes.json or upsert via 099.
 */

import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import pdfParse from 'pdf-parse'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

function arg(name) {
  const idx = process.argv.indexOf(`--${name}`)
  if (idx === -1 || !process.argv[idx + 1]) return null
  return process.argv[idx + 1]
}

const pdfPath = arg('pdf')
const frameworkId = arg('framework')
const subjectCode = arg('subject')
const topicId = arg('topic-id')
const titleEn = arg('title-en')
const titleFr = arg('title-fr')

if (!pdfPath || !frameworkId || !subjectCode || !topicId || !titleEn || !titleFr) {
  console.error(
    'Required: --pdf --framework --subject --topic-id --title-en --title-fr'
  )
  process.exit(1)
}

const buffer = readFileSync(pdfPath)
const parsed = await pdfParse(buffer)
const text = (parsed.text || '').replace(/\s+/g, ' ').trim()

const keywordCandidates = [
  ...new Set(
    (text.match(/[A-Za-zÀ-ÿ]{5,}/g) || [])
      .map((w) => w.toLowerCase())
      .filter((w) => w.length <= 24)
  ),
].slice(0, 12)

const draft = {
  source: 'minesec_pdf_ingest_draft',
  source_pdf: pdfPath,
  pages: parsed.numpages,
  framework_id: frameworkId,
  subject_code: subjectCode,
  topic_id: topicId,
  title_en: titleEn,
  title_fr: titleFr,
  grade_levels: ['form_4', 'form_5'],
  keywords: keywordCandidates,
  objectives: [],
  excerpt_chars: text.length,
  excerpt_preview: text.slice(0, 500),
}

const outDir = join(root, 'data/curriculum/ingest/drafts')
mkdirSync(outDir, { recursive: true })
const outPath = join(outDir, `${topicId}.json`)
writeFileSync(outPath, JSON.stringify(draft, null, 2))

console.log(`Draft node written: ${outPath}`)
console.log(`Extracted ${text.length} chars from ${parsed.numpages} pages`)
