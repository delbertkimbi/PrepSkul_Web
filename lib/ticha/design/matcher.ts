/**
 * Design Matching System
 * Matches user prompts to appropriate designs using keyword extraction and scoring
 */

import { MatchedDesign, ExtractedDesign } from '../types'
import { getTichaSupabaseAdmin } from '../supabase-service'
import { callOpenRouter } from '../openrouter'

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface OpenRouterResponse {
  id: string
  model: string
  choices: Array<{
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
}

interface OpenRouterOptions {
  model: string
  messages: OpenRouterMessage[]
  max_tokens?: number
  temperature?: number
  response_format?: { type: 'json_object' }
}

/**
 * Call OpenRouter API for keyword extraction
 */
async function callOpenRouterAPI(options: OpenRouterOptions): Promise<OpenRouterResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error('Missing OPENROUTER_API_KEY environment variable')
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://tichar.prepskul.com',
      'X-Title': 'Ticha AI',
    },
    body: JSON.stringify({
      model: options.model,
      messages: options.messages,
      max_tokens: options.max_tokens || 1000,
      temperature: options.temperature ?? 0.5,
      ...(options.response_format && { response_format: options.response_format }),
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenRouter API error: ${response.status} - ${error}`)
  }

  return response.json()
}

/**
 * Extract keywords from user prompt using AI
 */
async function extractKeywordsFromPrompt(userPrompt: string, content: string): Promise<string[]> {
  const systemPrompt = `You are a keyword extraction assistant. Extract relevant design-related keywords from the user's prompt and content.

Focus on:
- Design style preferences (e.g., "modern", "minimalist", "corporate", "creative", "bold", "elegant")
- Color preferences (e.g., "blue", "dark", "bright", "pastel")
- Layout preferences (e.g., "simple", "complex", "visual-heavy")
- Industry/context (e.g., "business", "academic", "marketing", "presentation")
- Mood/tone (e.g., "professional", "friendly", "serious", "energetic")

Return a JSON object with this structure:
{
  "keywords": ["keyword1", "keyword2", "keyword3", ...]
}

Extract 5-15 relevant keywords. Be specific and include synonyms.`

  const userMessage = `User prompt: "${userPrompt || 'No specific prompt'}"
Content preview: "${content.substring(0, 500)}..."

Extract design-related keywords.`

  const messages: OpenRouterMessage[] = [
    {
      role: 'system',
      content: systemPrompt,
    },
    {
      role: 'user',
      content: userMessage,
    },
  ]

  // Use cheaper models for keyword extraction
  const keywordModels = [
    'qwen/qwen-2-7b-instruct',
    'meta-llama/llama-3.2-3b-instruct',
    'google/gemini-flash-1.5',
  ]

  let response: OpenRouterResponse | null = null
  let lastError: Error | null = null

  for (const model of keywordModels) {
    try {
      response = await callOpenRouterAPI({
        model,
        messages,
        max_tokens: 500,
        temperature: 0.3,
        response_format: { type: 'json_object' },
      })
      break
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      continue
    }
  }

  if (!response) {
    // Fallback: extract simple keywords from prompt
    const fallbackKeywords = (userPrompt || '')
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3)
      .slice(0, 10)
    return fallbackKeywords
  }

  try {
    const content = response.choices[0]?.message?.content
    if (!content) {
      console.warn('[DesignMatcher] No content in keyword extraction response')
      return []
    }

    const parsed = JSON.parse(content)
    const keywords = Array.isArray(parsed.keywords) ? parsed.keywords : []
    
    // Normalize keywords (lowercase, trim)
    const normalized = keywords.map((k: string) => k.toLowerCase().trim()).filter((k: string) => k.length > 0)
    console.log(`[DesignMatcher] Extracted ${normalized.length} keywords from prompt:`, normalized)
    return normalized
  } catch (error) {
    console.warn('[DesignMatcher] Failed to parse keywords, using fallback:', error)
    // Use fallback
    const fallbackKeywords = (userPrompt || '')
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3)
      .slice(0, 10)
    console.log(`[DesignMatcher] Using fallback keywords:`, fallbackKeywords)
    return fallbackKeywords
  }
}

/**
 * Match designs to user prompt
 */
export async function matchDesignsToPrompt(
  userPrompt: string,
  content: string,
  limit: number = 5,
  userId?: string,
  designSetId?: string
): Promise<MatchedDesign[]> {
  // Step 1: Extract keywords from prompt using AI
  const extractedKeywords = await extractKeywordsFromPrompt(userPrompt, content)
  console.log(`[DesignMatcher] AI-extracted keywords:`, extractedKeywords)

  // Step 1b: Also extract direct keywords from prompt (exact words user typed)
  // This ensures exact keyword matches work even if AI extraction misses them
  const directKeywords = (userPrompt || '')
    .toLowerCase()
    .split(/[\s,;]+/) // Split by spaces, commas, semicolons
    .map(k => k.trim())
    .filter(k => k.length >= 2) // Include words 2+ chars (more lenient)
    .filter(k => !['the', 'a', 'an', 'and', 'or', 'but', 'for', 'with', 'from', 'to', 'of', 'in', 'on', 'at'].includes(k)) // Remove common words

  // Combine AI-extracted and direct keywords, remove duplicates
  const allKeywords = [...new Set([...extractedKeywords, ...directKeywords])]
  console.log(`[DesignMatcher] Combined keywords (AI + direct):`, allKeywords)
  console.log(`[DesignMatcher] User prompt: "${userPrompt}"`)
  console.log(`[DesignMatcher] Content preview: "${content.substring(0, 100)}..."`)

  // Step 2: Query database for matching designs
  const supabase = getTichaSupabaseAdmin()

  // Build query - get all designs (even without extracted specs, as long as they have keywords)
  // We'll filter in JS for reliability
  let query = supabase
    .from('ticha_design_inspiration')
    .select('*')
    // Don't require extracted_design_spec - designs with keywords should still be matchable

  // If designSetId is provided, prioritize designs from that set
  if (designSetId) {
    query = query.eq('category', `user-set:${designSetId}`)
    console.log(`[DesignMatcher] Filtering by design set: ${designSetId}`)
  } else if (userId) {
    // If userId provided but no set, prioritize user's designs
    query = query.or(`uploaded_by.eq.${userId},category.ilike.user-set:%,category.eq.user-uploaded`)
    console.log(`[DesignMatcher] Prioritizing user's designs: ${userId}`)
  }

  // Apply ordering
  query = query
    .order('quality_score', { ascending: false, nullsLast: true })
    .order('usage_count', { ascending: false })

  // Fetch all matching designs (we'll filter by keywords in JS for reliability)
  const { data: allDesigns, error } = await query.limit(100) // Get more to filter

  if (error) {
    console.error('[DesignMatcher] Database query error:', error)
    console.error('[DesignMatcher] Error details:', JSON.stringify(error, null, 2))
    return []
  }

  console.log(`[DesignMatcher] Found ${allDesigns?.length || 0} total designs in database`)

  // Log all designs with their keywords for debugging
  if (allDesigns && allDesigns.length > 0) {
    console.log(`[DesignMatcher] Designs in database:`)
    allDesigns.forEach((design, idx) => {
      console.log(`  Design ${idx + 1}: id=${design.id}, keywords=`, design.keywords, `has_extracted_spec=${!!design.extracted_design_spec}`)
    })
  }

  // Filter designs by keyword match in JavaScript (more reliable than SQL array queries)
  let designs = allDesigns || []
  
  // If no keywords found, return all designs with extracted specs (fallback)
  if (allKeywords.length === 0) {
    console.log(`[DesignMatcher] No keywords found, using all designs with extracted specs`)
    designs = designs.filter(d => d.extracted_design_spec)
  } else {
    console.log(`[DesignMatcher] Filtering ${designs.length} designs by keywords:`, allKeywords)
    designs = designs.filter((design) => {
      // Log each design being checked
      console.log(`[DesignMatcher] Checking design ${design.id}: keywords=`, design.keywords)
      
      if (!design.keywords || !Array.isArray(design.keywords) || design.keywords.length === 0) {
        console.log(`[DesignMatcher] Design ${design.id} has no keywords, skipping`)
        return false // Skip designs without keywords
      }
      
      // Normalize keywords for comparison
      const designKeywords = design.keywords.map((k: string) => k.toLowerCase().trim())
      const normalizedSearch = allKeywords.map(k => k.toLowerCase().trim())
      
      console.log(`[DesignMatcher] Comparing: search=${normalizedSearch} vs design=${designKeywords}`)
      
      // Check if any search keyword matches any design keyword (exact or partial)
      const hasMatch = normalizedSearch.some(searchKw => 
        designKeywords.some(designKw => {
          // Exact match
          if (designKw === searchKw) {
            console.log(`[DesignMatcher] ✓ Exact match: "${searchKw}" = "${designKw}"`)
            return true
          }
          // Partial match (one contains the other)
          if (designKw.includes(searchKw) || searchKw.includes(designKw)) {
            console.log(`[DesignMatcher] ✓ Partial match: "${searchKw}" ~ "${designKw}"`)
            return true
          }
          return false
        })
      )
      
      if (hasMatch) {
        console.log(`[DesignMatcher] ✓ Design ${design.id} MATCHED!`)
      } else {
        console.log(`[DesignMatcher] ✗ Design ${design.id} no match`)
      }
      
      return hasMatch
    })
    
    console.log(`[DesignMatcher] After keyword filtering: ${designs.length} designs match`)
  }

  if (!designs || designs.length === 0) {
    console.log('[DesignMatcher] No matching designs found after filtering')
    // Debug: Check if there are ANY designs at all
    const { data: debugDesigns } = await supabase
      .from('ticha_design_inspiration')
      .select('id, keywords, extracted_design_spec')
      .limit(5)
    console.log(`[DesignMatcher] Debug - Total designs in DB: ${debugDesigns?.length || 0}`)
    if (debugDesigns && debugDesigns.length > 0) {
      console.log('[DesignMatcher] Debug - Sample design keywords:', debugDesigns[0]?.keywords)
      console.log('[DesignMatcher] Debug - Sample design has extracted_spec:', !!debugDesigns[0]?.extracted_design_spec)
    }
    return []
  }

  // Step 3: Score matches
  const scoredDesigns = designs.map((design) => {
    let matchScore = 0

    // Keyword overlap score (0-50 points)
    if (design.keywords && Array.isArray(design.keywords) && allKeywords.length > 0) {
      const designKeywords = design.keywords.map((k: string) => k.toLowerCase().trim())
      const normalizedSearch = allKeywords.map(k => k.toLowerCase().trim())
      const overlap = normalizedSearch.filter((k) => 
        designKeywords.some(dk => dk === k || dk.includes(k) || k.includes(dk))
      ).length
      matchScore += (overlap / Math.max(allKeywords.length, designKeywords.length)) * 50
    } else if (allKeywords.length === 0) {
      // If no keywords extracted, give base score
      matchScore += 25
    }

    // Quality score (0-30 points)
    if (design.quality_score) {
      matchScore += (design.quality_score / 100) * 30
    } else {
      matchScore += 15 // Default quality assumption
    }

    // Usage count score (0-20 points) - prefer proven designs
    if (design.usage_count) {
      matchScore += Math.min((design.usage_count / 100) * 20, 20)
    }

    const extractedDesign = design.extracted_design_spec ? (design.extracted_design_spec as ExtractedDesign) : null
    
    console.log(`[DesignMatcher] Scoring design ${design.id}: matchScore=${matchScore.toFixed(2)}, hasExtractedSpec=${!!extractedDesign}, keywords=${(design.keywords || []).length}`)

    return {
      designId: design.id,
      matchScore,
      keywords: design.keywords || [],
      extractedDesign: extractedDesign,
      category: design.category,
    }
  })

  // Step 4: Sort by match score and return top results
  // Note: We include designs even without extracted specs if they match by keywords
  // The openrouter code will handle null extractedDesign gracefully
  const matchedDesigns = scoredDesigns
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit)
    .map((design) => {
      // If no extracted design, create a basic one from keywords and category
      let extractedDesign = design.extractedDesign
      
      if (!extractedDesign && design.keywords && design.keywords.length > 0) {
        // Create a fallback extracted design based on keywords
        console.log(`[DesignMatcher] Creating fallback extracted design for design ${design.designId}`)
        extractedDesign = {
          colorPalette: ['#2563eb', '#1e40af', '#3b82f6', '#60a5fa', '#93c5fd'], // Default blue palette
          typography: {
            fonts: ['Poppins', 'Inter'],
            sizes: [32, 24, 18, 16],
            weights: ['bold', 'semibold', 'normal'],
          },
          layoutPattern: 'title-and-bullets',
          spacing: {
            margins: [40, 40, 40, 40],
            padding: [20, 20, 20, 20],
          },
          styleKeywords: design.keywords.slice(0, 5),
          qualityScore: design.matchScore > 50 ? 75 : 50, // Estimate based on match score
          designSpec: {
            background_color: 'light-blue',
            text_color: 'black',
            layout: 'title-and-bullets',
            icon: 'none',
          },
        }
      }
      
      return {
        designId: design.designId,
        matchScore: Math.round(design.matchScore * 100) / 100, // Round to 2 decimals
        keywords: design.keywords,
        extractedDesign: extractedDesign,
        category: design.category,
      }
    })
    .filter(design => design.extractedDesign !== null) // Only return if we have a design (original or fallback)

  console.log(`[DesignMatcher] Matched ${matchedDesigns.length} designs (after processing)`)
  if (matchedDesigns.length > 0) {
    console.log(`[DesignMatcher] Top match: designId=${matchedDesigns[0].designId}, score=${matchedDesigns[0].matchScore}, hasExtracted=${!!matchedDesigns[0].extractedDesign}`)
  }
  return matchedDesigns
}

/**
 * Increment usage count for a design
 */
export async function incrementDesignUsage(designId: string): Promise<void> {
  const supabase = getTichaSupabaseAdmin()

  const { error } = await supabase.rpc('increment_design_usage', { design_id: designId })

  if (error) {
    // If RPC doesn't exist, do manual update
    const { data: current } = await supabase
      .from('ticha_design_inspiration')
      .select('usage_count')
      .eq('id', designId)
      .single()

    if (current) {
      await supabase
        .from('ticha_design_inspiration')
        .update({ usage_count: (current.usage_count || 0) + 1 })
        .eq('id', designId)
    }
  }
}

