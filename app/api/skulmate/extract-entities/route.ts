/**
 * Entity Extraction API
 * Extracts entities, relationships, conflicts, and progression from notes
 * Uses cheaper model for cost efficiency
 */

import { NextRequest, NextResponse } from 'next/server'
import { callOpenRouterWithKey } from '@/lib/ticha/openrouter'

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
}

interface EntityExtractionRequest {
  text: string
}

interface Entity {
  type: 'person' | 'formula' | 'event' | 'concept' | 'term' | 'process' | 'relationship' | 'other'
  name: string
  context: string
  importance: 'high' | 'medium' | 'low'
}

interface Relationship {
  from: string
  to: string
  type: string
  description?: string
}

interface Conflict {
  entity: string
  issue: string
  consequence: string
  context?: string
}

interface Progression {
  step: number
  concept: string
  unlocks: string
  prerequisites?: string[]
}

interface EntityExtractionResult {
  entities: Entity[]
  relationships: Relationship[]
  conflicts: Conflict[]
  progression: Progression[]
}

/**
 * Get skulMate OpenRouter API key
 */
function getSkulMateApiKey(): string {
  const key = process.env.SKULMATE_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY
  if (!key) {
    throw new Error('Missing SKULMATE_OPENROUTER_API_KEY or OPENROUTER_API_KEY environment variable')
  }
  return key
}

/**
 * Extract entities and relationships from text using cheaper model
 * Exported for use in other routes
 */
export async function extractEntities(text: string): Promise<EntityExtractionResult> {
  const systemPrompt = `You are an expert at analyzing educational content and extracting structured knowledge.

Your task is to analyze the provided text and extract:
1. **Entities**: Key people, terms, formulas, events, concepts, processes
2. **Relationships**: How entities connect to each other
3. **Conflicts**: What can go wrong if concepts are misunderstood
4. **Progression**: Learning sequence and dependencies

CRITICAL RULES:
- Extract ONLY from the actual text provided
- Do NOT make up entities that aren't mentioned
- Focus on educational/learning-relevant entities
- Identify relationships that matter for understanding
- Find potential misconceptions and their consequences
- Map out learning progression (what builds on what)

Return ONLY valid JSON.`

  const userPrompt = `Analyze this content and extract entities, relationships, conflicts, and progression:

${text}

Return a JSON object with this exact structure:
{
  "entities": [
    {
      "type": "person|formula|event|concept|term|process|relationship|other",
      "name": "Entity name",
      "context": "Where/how it appears in the text",
      "importance": "high|medium|low"
    }
  ],
  "relationships": [
    {
      "from": "Entity name",
      "to": "Entity name",
      "type": "discovered|enables|causes|requires|relates_to|etc",
      "description": "Optional description"
    }
  ],
  "conflicts": [
    {
      "entity": "Entity name",
      "issue": "What can go wrong",
      "consequence": "What happens if misunderstood",
      "context": "Optional context"
    }
  ],
  "progression": [
    {
      "step": 1,
      "concept": "Concept name",
      "unlocks": "What this enables",
      "prerequisites": ["Optional prerequisite concepts"]
    }
  ]
}`

  // Use cheaper models for entity extraction
  const extractionModels = [
    'qwen/qwen-2-7b-instruct',      // Cheapest
    'meta-llama/llama-3.2-3b-instruct', // Free tier
    'mistralai/mistral-7b-instruct', // Cheap
    'qwen/qwen-2-14b-instruct',     // Slightly more expensive
    'google/gemini-flash-1.5',      // Google model
  ]

  const skulMateApiKey = getSkulMateApiKey()
  let response
  let lastError: Error | null = null

  for (const model of extractionModels) {
    try {
      console.log(`[Entity Extraction] Trying model: ${model}`)
      response = await callOpenRouterWithKey(skulMateApiKey, {
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3, // Lower temperature for more consistent extraction
        max_tokens: 3000,
        response_format: { type: 'json_object' },
      })
      console.log(`[Entity Extraction] Success with model: ${model}`)
      break
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.warn(`[Entity Extraction] Model ${model} failed:`, lastError.message)
      
      if (lastError.message.includes('402') || lastError.message.includes('credits')) {
        throw new Error('OpenRouter credits required. Please purchase credits at https://openrouter.ai/settings/credits')
      }
      continue
    }
  }

  if (!response) {
    throw new Error(`Failed to extract entities. All models failed. Last error: ${lastError?.message || 'Unknown error'}`)
  }

  if (!response.choices || response.choices.length === 0) {
    throw new Error('No response from AI')
  }

  const content = response.choices[0].message?.content || ''
  
  // Extract JSON from response
  let jsonContent = content.trim()
  if (jsonContent.startsWith('```')) {
    jsonContent = jsonContent.replace(/^```json\n?/, '').replace(/\n?```$/, '')
  }
  if (jsonContent.startsWith('```')) {
    jsonContent = jsonContent.replace(/^```\n?/, '').replace(/\n?```$/, '')
  }

  try {
    const result: EntityExtractionResult = JSON.parse(jsonContent)
    
    // Validate structure
    if (!result.entities || !Array.isArray(result.entities)) {
      result.entities = []
    }
    if (!result.relationships || !Array.isArray(result.relationships)) {
      result.relationships = []
    }
    if (!result.conflicts || !Array.isArray(result.conflicts)) {
      result.conflicts = []
    }
    if (!result.progression || !Array.isArray(result.progression)) {
      result.progression = []
    }

    return result
  } catch (parseError) {
    console.error('[Entity Extraction] JSON parse error:', parseError)
    console.error('[Entity Extraction] Raw content:', jsonContent.substring(0, 500))
    throw new Error(`Failed to parse entity extraction result: ${parseError instanceof Error ? parseError.message : 'Invalid JSON'}`)
  }
}

/**
 * POST /api/skulmate/extract-entities
 * Extract entities, relationships, conflicts, and progression from text
 */
export async function POST(request: NextRequest) {
  // Handle CORS
  const origin = request.headers.get('origin')
  if (origin) {
    corsHeaders['Access-Control-Allow-Origin'] = origin
    corsHeaders['Access-Control-Allow-Credentials'] = 'true'
  } else {
    corsHeaders['Access-Control-Allow-Origin'] = '*'
  }

  // Handle OPTIONS request
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: corsHeaders })
  }

  try {
    const body: EntityExtractionRequest = await request.json()
    const { text } = body

    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        { error: 'Text must be at least 50 characters long' },
        { status: 400, headers: corsHeaders }
      )
    }

    console.log('[Entity Extraction] Starting extraction...')
    const result = await extractEntities(text)
    console.log(`[Entity Extraction] Extracted ${result.entities.length} entities, ${result.relationships.length} relationships`)

    return NextResponse.json(result, { headers: corsHeaders })
  } catch (error) {
    console.error('[Entity Extraction] Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500, headers: corsHeaders }
    )
  }
}

