#!/usr/bin/env node
/**
 * Upsert curriculum_nodes from data/curriculum/seed-nodes.json into Supabase.
 *
 * Usage (from PrepSkul_Web):
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-curriculum-nodes.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const seedPath = join(__dirname, '../data/curriculum/seed-nodes.json')

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const seed = JSON.parse(readFileSync(seedPath, 'utf8'))
const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const frameworkIds = [...new Set(seed.nodes.map((n) => n.framework_id))]
const { error: fwError } = await supabase
  .from('curriculum_frameworks')
  .select('id')
  .in('id', frameworkIds)

if (fwError) {
  console.error('Framework check failed:', fwError.message)
  process.exit(1)
}

const rows = seed.nodes.map((node, index) => ({
  framework_id: node.framework_id,
  subject_code: node.subject_code,
  topic_id: node.topic_id,
  title_en: node.title_en,
  title_fr: node.title_fr,
  grade_levels: node.grade_levels,
  objectives: node.objectives,
  keywords: node.keywords,
  sort_order: index,
}))

const { data, error } = await supabase
  .from('curriculum_nodes')
  .upsert(rows, { onConflict: 'topic_id' })
  .select('topic_id')

if (error) {
  console.error('Upsert failed:', error.message)
  process.exit(1)
}

console.log(`Seeded ${data?.length ?? rows.length} curriculum nodes from ${seedPath}`)
