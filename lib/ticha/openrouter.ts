/**
 * OpenRouter API Client for Tichar AI and skulMate
 * Handles all AI model interactions with design-focused prompts
 * 
 * Supports separate API keys for TichaAI and skulMate for usage tracking
 */

import type { AggregatedDesignSpec } from './types'
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

/**
 * Get OpenRouter API key for TichaAI (lazy evaluation to avoid build-time errors)
 */
function getTichaOpenRouterApiKey(): string {
  // Try TichaAI-specific key first, fallback to general key for backward compatibility
  const key = process.env.TICHA_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY
  if (!key) {
    throw new Error('Missing TICHA_OPENROUTER_API_KEY or OPENROUTER_API_KEY environment variable')
  }
  return key
}

/**
 * Get OpenRouter API key for skulMate (lazy evaluation to avoid build-time errors)
 */
function getSkulMateOpenRouterApiKey(): string {
  const key = process.env.SKULMATE_OPENROUTER_API_KEY
  if (!key) {
    throw new Error('Missing SKULMATE_OPENROUTER_API_KEY environment variable')
  }
  return key
}

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant'
  content: string | Array<{ type: 'text' | 'image_url'; text?: string; image_url?: { url: string } }>
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
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

interface OpenRouterOptions {
  model: string
  messages: OpenRouterMessage[]
  max_tokens?: number
  temperature?: number
  response_format?: { type: 'json_object' }
}

/**
 * Call OpenRouter API (for TichaAI - uses TichaAI-specific key)
 */
export async function callOpenRouter(options: OpenRouterOptions): Promise<OpenRouterResponse> {
  const apiKey = getTichaOpenRouterApiKey()
  
  if (!apiKey) {
    throw new Error('Missing TICHA_OPENROUTER_API_KEY or OPENROUTER_API_KEY environment variable')
  }
  
  return callOpenRouterWithKey(apiKey, options)
}

/**
 * Call OpenRouter API with a specific API key (for skulMate)
 */
export async function callOpenRouterWithKey(apiKey: string, options: OpenRouterOptions): Promise<OpenRouterResponse> {
  if (!apiKey) {
    throw new Error('API key is required')
  }

  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
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
      max_tokens: options.max_tokens || 4000,
      temperature: options.temperature ?? 0.7,
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
 * Clean and normalize text with AI
 * Tries multiple models with fallback chain
 */
export async function cleanText(rawText: string): Promise<string> {
  const messages: OpenRouterMessage[] = [
    {
      role: 'system',
      content: `You are a text cleaning assistant. Your task is to clean and normalize text content while preserving its meaning and structure.

Rules:
- Remove excessive whitespace, extra line breaks, and formatting artifacts
- Fix common OCR errors and typos
- Normalize punctuation and capitalization
- Preserve paragraph structure and bullet points
- Keep all meaningful content intact
- Return ONLY the cleaned text, no explanations or meta-commentary`,
    },
    {
      role: 'user',
      content: `Clean this text content:\n\n${rawText.substring(0, 4000)}`, // Limit input to avoid token limits
    },
  ]

  // Try multiple models - prioritize free/cheap models
  const textModels = [
    'qwen/qwen-2-7b-instruct',  // Qwen 2 (correct ID)
    'qwen/qwen-2-14b-instruct', // Qwen 2 larger
    'meta-llama/llama-3.2-3b-instruct', // Free tier
    'mistralai/mistral-7b-instruct', // Cheap
    'google/gemini-flash-1.5', // Google model
  ]

  let response
  let lastError: Error | null = null

  for (const model of textModels) {
    try {
      console.log(`[CleanText] Trying model: ${model}`)
      response = await callOpenRouter({
        model,
        messages,
        max_tokens: 4000,
        temperature: 0.3, // Lower temperature for cleaning tasks
      })
      console.log(`[CleanText] Success with model: ${model}`)
      break
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.warn(`[CleanText] Model ${model} failed:`, lastError.message)
      
      // If it's a credits error, stop trying (all will fail)
      if (lastError.message.includes('402') || lastError.message.includes('credits')) {
        console.warn('[CleanText] Credits required - skipping text cleaning, using original text')
        return rawText // Return original if credits are needed
      }
      continue
    }
  }

  if (!response) {
    console.warn('[CleanText] All models failed, using original text:', lastError?.message)
    return rawText // Fallback to original text
  }

  return response.choices[0]?.message?.content || rawText
}

/**
 * Generate presentation outline with design specifications
 * Tries multiple models with fallback chain
 */
export async function generateOutline(
  cleanedText: string,
  userPrompt?: string,
  options?: {
    designPreset?: string
    customDesignPrompt?: string
    refinementPrompt?: string
    existingSlides?: Array<{
      slide_title: string
      bullets: string[]
      design: any
    }>
    matchedDesigns?: Array<{
      designId: string
      matchScore: number
      keywords: string[]
      extractedDesign: {
        colorPalette: string[]
        typography: { fonts: string[]; sizes: number[]; weights: string[] }
        layoutPattern: string
        spacing: { margins: number[]; padding: number[] }
        styleKeywords: string[]
        qualityScore: number
        designSpec: any
      }
      category?: string
    }>
    activeDesign?: AggregatedDesignSpec
  }
): Promise<{
  slides: Array<{
    slide_title: string
    bullets: string[]
    design: {
      background_color: 'light-blue' | 'dark-blue' | 'white' | 'gray' | 'green' | string
      text_color: 'black' | 'white' | string
      layout: 'title-only' | 'title-and-bullets' | 'two-column' | 'image-left' | 'image-right'
      icon: 'none' | 'book' | 'idea' | 'warning' | 'check'
    }
  }>
}> {
  let systemPrompt = `You are an expert presentation designer specializing in creating visually compelling and well-structured slide presentations.

Your task is to analyze content and create a structured presentation outline with detailed design specifications for each slide.

DESIGN PRINCIPLES (PREMIUM QUALITY):
1. **Visual Excellence**: Create stunning, modern designs that impress and engage
2. **Professional Aesthetics**: Use sophisticated color gradients, elegant typography, and balanced spacing
3. **Visual Hierarchy**: Use varied layouts to create visual interest and guide attention
4. **Color Psychology**: Choose beautiful gradient backgrounds that enhance readability and convey appropriate tone
5. **Theme Consistency**: Maintain visual coherence while allowing slide-specific design choices
6. **Content Balance**: Match layout complexity to content density

LAYOUT OPTIONS:
- **title-only**: For impactful opening/closing slides, quotes, or single key messages (use dramatic colors)
- **title-and-bullets**: Standard content slides with 3-6 bullet points (most common)
- **two-column**: For comparisons, before/after, or side-by-side concepts
- **image-left**: Visual-heavy slides where image supports main content
- **image-right**: Content-first slides with supporting visuals

BACKGROUND COLORS (PREMIUM GRADIENTS - choose strategically):
- **#FF8A00** or **orange**: Vibrant business orange - Modern, energetic, professional, bold (DEFAULT - Business Template)
- **#2D3542** or **dark-gray-blue**: Dark gray/blue - Professional, corporate, trustworthy, serious
- **#FFFFFF** or **white**: Pure white - Clean, minimalist, professional, high contrast
- **light-blue**: Modern purple-blue gradient (#667eea to #764ba2) - Friendly, professional, modern
- **dark-blue**: Deep professional blue gradient (#1e3c72 to #2a5298) - Authoritative, trustworthy, serious topics
- **gray**: Elegant gray gradient (#e0e0e0 to #bdbdbd) - Neutral, balanced, corporate excellence
- **green**: Modern teal-green gradient (#11998e to #38ef7d) - Growth, success, positive outcomes, vibrant

ICON SELECTION (use sparingly):
- **none**: Clean, text-focused slides
- **book**: Educational content, references, learning
- **idea**: Innovation, concepts, brainstorming
- **warning**: Important notices, cautions, attention
- **check**: Accomplishments, success, completion`

  // If we have an ACTIVE aggregated design from the latest admin design set,
  // it should override the generic preset guidance above.
  if (options?.activeDesign) {
    const ad = options.activeDesign
    systemPrompt += `

ACTIVE DESIGN OVERRIDE (FROM TRAINED SLIDE SET):
You have a single GLOBAL design specification learned from real human-made slides.
You MUST follow this ACTIVE DESIGN for ALL slides unless the user explicitly asks otherwise.

ACTIVE COLOR PALETTE:
- Primary & dominant colors: ${ad.colorPalette.join(', ') || 'not specified'}

ACTIVE TYPOGRAPHY:
- Fonts (in order of importance): ${ad.typography.fonts.join(', ') || 'not specified'}
- Font sizes (approx): ${ad.typography.sizes.join(', ') || 'not specified'}

ACTIVE LAYOUT PATTERNS:
- Preferred layouts: ${ad.layoutPatterns.join(', ') || 'title-and-bullets'}

ACTIVE SPACING:
- Margins: [${ad.spacing.margins.join(', ')}]
- Padding: [${ad.spacing.padding.join(', ')}]

ACTIVE DESIGN SPEC (BASE SLIDE STYLE):
- background_color: ${ad.designSpec.background_color}
- text_color: ${ad.designSpec.text_color}
- fontFamily: ${ad.designSpec.fontFamily || ad.typography.fonts[0] || 'Montserrat'}
- fontSize: ${ad.designSpec.fontSize || ad.typography.sizes[0] || 32}
- customColors: ${JSON.stringify(ad.designSpec.customColors || {})}

CRITICAL RULES WHEN ACTIVE DESIGN IS PRESENT:
1. Ignore generic color/font suggestions above. Use ONLY the colors and fonts from the ACTIVE DESIGN.
2. For each slide, choose background_color from the ACTIVE colorPalette (usually the first one for main backgrounds).
3. For each slide, set fontFamily to the ACTIVE title font (first in fonts list) and fontSize consistent with ACTIVE sizes.
4. Keep layouts consistent with ACTIVE layoutPatterns where possible.
5. Maintain overall style keywords: ${ad.styleKeywords.join(', ') || 'modern, professional'}.
`
  }

  // Add matched design context if provided
  // Filter out designs without extracted specs
  const validMatchedDesigns = options?.matchedDesigns?.filter(m => m.extractedDesign !== null && m.extractedDesign !== undefined) || []
  
  if (validMatchedDesigns.length > 0) {
    systemPrompt += `\n\nDESIGN INSPIRATION (HIGH-QUALITY EXAMPLES TO EMULATE):\n`
    systemPrompt += `You have access to ${validMatchedDesigns.length} high-quality design examples that match the user's requirements. Study these designs and emulate their quality, style, and aesthetic choices.\n\n`

    validMatchedDesigns.forEach((matched, index) => {
      const design = matched.extractedDesign
      if (!design) return // Skip if somehow null (shouldn't happen after filter)
      
      systemPrompt += `Design Example ${index + 1} (Match Score: ${matched.matchScore}, Quality: ${design.qualityScore || 'N/A'}/100):\n`
      systemPrompt += `- Keywords: ${matched.keywords.join(', ')}\n`
      
      if (design.colorPalette && Array.isArray(design.colorPalette) && design.colorPalette.length > 0) {
        systemPrompt += `- Color Palette: ${design.colorPalette.slice(0, 5).join(', ')}${design.colorPalette.length > 5 ? '...' : ''}\n`
      }
      
      if (design.typography) {
        const fonts = design.typography.fonts || []
        const sizes = design.typography.sizes || []
        if (fonts.length > 0 || sizes.length > 0) {
          systemPrompt += `- Typography: ${fonts.join(', ')}${sizes.length > 0 ? ` (sizes: ${sizes.join(', ')})` : ''}\n`
        }
      }
      
      if (design.layoutPattern) {
        systemPrompt += `- Layout Pattern: ${design.layoutPattern}\n`
      }
      
      if (design.styleKeywords && Array.isArray(design.styleKeywords) && design.styleKeywords.length > 0) {
        systemPrompt += `- Style: ${design.styleKeywords.join(', ')}\n`
      }
      
      if (design.designSpec) {
        systemPrompt += `- Design Spec: ${JSON.stringify(design.designSpec)}\n`
      }
      systemPrompt += `\n`
    })

    systemPrompt += `\n\nCRITICAL: USING MATCHED DESIGN SPECIFICATIONS:\n`
    systemPrompt += `You MUST use the EXACT design specifications from the matched designs above. This is NOT optional.\n\n`
    systemPrompt += `REQUIRED ACTIONS:\n`
    systemPrompt += `1. **COLORS**: Use the EXACT hex color codes from the matched design's colorPalette. For background_color, use the PRIMARY color from the palette (usually the first one). If multiple colors are provided, create gradients or use them as accent colors.\n`
    systemPrompt += `2. **TYPOGRAPHY**: Use the EXACT fonts from the matched design's typography.fonts array. Use the EXACT font sizes from typography.sizes. The first font should be used for titles, the second for body text.\n`
    systemPrompt += `3. **LAYOUTS**: Use the layout pattern from the matched design. If it says "title-and-bullets", use that. If it's a custom layout, adapt it to the closest matching layout option.\n`
    systemPrompt += `4. **STYLE**: Match the style keywords - if it says "modern business", make it modern and business-like. If it says "minimalist", keep it minimal.\n`
    systemPrompt += `5. **QUALITY**: Maintain the same quality level (qualityScore) - if it's 85+, create premium designs.\n\n`
    systemPrompt += `OUTPUT FORMAT FOR COLORS:\n`
    systemPrompt += `- For background_color: Use the PRIMARY hex color from the matched design's colorPalette (e.g., "#FF8C00" or "#343A40")\n`
    systemPrompt += `- DO NOT use predefined color names like "light-blue" unless the matched design specifically uses those colors\n`
    systemPrompt += `- If the matched design has a gradient, use the starting color as the primary background_color\n\n`
    systemPrompt += `OUTPUT FORMAT FOR TYPOGRAPHY:\n`
    systemPrompt += `- Include fontFamily in the design object with the EXACT font name from the matched design\n`
    systemPrompt += `- Include fontSize with the EXACT size from the matched design (use the title size for titles, body size for bullets)\n\n`
    systemPrompt += `EXAMPLE:\n`
    systemPrompt += `If matched design has:\n`
    systemPrompt += `- colorPalette: ["#FF8C00", "#343A40", "#FFFFFF"]\n`
    systemPrompt += `- typography: { fonts: ["Montserrat", "Open Sans"], sizes: [48, 24, 18] }\n`
    systemPrompt += `Then your output should have:\n`
    systemPrompt += `- background_color: "#FF8C00" (the primary color)\n`
    systemPrompt += `- fontFamily: "Montserrat" (for titles)\n`
    systemPrompt += `- fontSize: 48 (for titles), 24 (for body)\n`
  }

  systemPrompt += `\nOUTPUT FORMAT:
Return a JSON object with this exact structure:
{
  "slides": [
    {
      "slide_title": "Slide Title Here",
      "bullets": ["Bullet point 1", "Bullet point 2", ...],
      "design": {
        "background_color": "#FF8A00 (REQUIRED for first slide - business orange) or #2D3542 (dark gray-blue) or #FFFFFF (white) - DO NOT use light-blue, dark-blue, or any purple/blue gradients",
        "text_color": "black | white (use white for dark backgrounds like #FF8A00 and #2D3542, black for #FFFFFF)",
        "layout": "title-only | title-and-bullets | two-column | image-left | image-right",
        "icon": "none | book | idea | warning | check",
        "fontFamily": "Montserrat (REQUIRED - business template font)",
        "fontSize": 48 (REQUIRED for first slide title, use 32 for other slide titles, 18 for body text)
      }
    }
  ]
}

GUIDELINES:
- Create 5-12 slides depending on content length
- Vary layouts for visual interest (don't use same layout for all slides)
- DEFAULT COLOR SCHEME: Use business template colors - #FF8A00 (orange) for title/emphasis slides, #2D3542 (dark gray-blue) or #FFFFFF (white) for content slides
- DEFAULT FONTS: Use Montserrat for titles (48pt), Open Sans for body text (18pt)
- Choose colors that enhance readability (light backgrounds = dark text, dark backgrounds = white text)
- Use icons strategically (not on every slide)
- Group related content logically
- Start with title slide, end with summary/conclusion
- Ensure bullets are concise (max 15 words each)
- Make slide titles compelling and clear
${options?.matchedDesigns && options.matchedDesigns.length > 0 ? `

⚠️ CRITICAL REMINDER - MATCHED DESIGNS PROVIDED:
You have been given ${options.matchedDesigns.length} matched design(s) above with EXACT specifications.
- You MUST use the EXACT hex color codes from the matched design's colorPalette
- You MUST use the EXACT font names from the matched design's typography.fonts
- You MUST use the EXACT font sizes from the matched design's typography.sizes
- Every slide MUST include "fontFamily" and "fontSize" fields in the design object
- Use the PRIMARY color (first in colorPalette) as background_color
- This is NOT optional - the user expects slides that visually match the training design
- DO NOT use generic color names like "light-blue" - use the actual hex codes provided` : ''}`

  let userMessage = ''
  if (options?.refinementPrompt && options?.existingSlides) {
    userMessage = `Refine this presentation based on the user's feedback:\n\n${options.refinementPrompt}\n\nOriginal content:\n${cleanedText}`
  } else {
    userMessage = userPrompt
      ? `Create a presentation outline from this content with design specifications:\n\n${cleanedText}\n\nUser preference: ${userPrompt}`
      : `Create a presentation outline from this content with design specifications:\n\n${cleanedText}`
  }

  const messages: OpenRouterMessage[] = [
    {
      role: 'system',
      content: systemPrompt,
    },
    {
      role: 'user',
      content: userMessage.substring(0, 12000), // Limit to avoid token limits
    },
  ]

  // Try multiple models for outline generation - prioritize larger models
  const outlineModels = [
    'qwen/qwen-2-14b-instruct', // Qwen 2 (correct ID)
    'qwen/qwen-2-7b-instruct', // Qwen 2 smaller
    'meta-llama/llama-3.2-11b-instruct', // Llama 3.2
    'mistralai/mistral-7b-instruct', // Mistral
    'google/gemini-flash-1.5', // Google model
  ]

  let response
  let lastError: Error | null = null

  for (const model of outlineModels) {
    try {
      console.log(`[GenerateOutline] Trying model: ${model}`)
      response = await callOpenRouter({
        model,
        messages,
        max_tokens: 4000,
        temperature: 0.8, // Higher temperature for creative design choices
        response_format: { type: 'json_object' },
      })
      console.log(`[GenerateOutline] Success with model: ${model}`)
      break
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.warn(`[GenerateOutline] Model ${model} failed:`, lastError.message)
      continue
    }
  }

  if (!response) {
    throw new Error(`Failed to generate outline. All models failed. Last error: ${lastError?.message || 'Unknown error'}. Please check OpenRouter configuration or purchase credits.`)
  }

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error('No content returned from outline generation')
  }

  try {
    // Parse JSON response
    const parsed = JSON.parse(content)
    
    // Validate structure
    if (!parsed.slides || !Array.isArray(parsed.slides)) {
      throw new Error('Invalid outline structure: missing slides array')
    }

    // Validate each slide
    for (const slide of parsed.slides) {
      if (!slide.slide_title || !slide.design) {
        throw new Error('Invalid slide structure')
      }
      if (!slide.bullets) {
        slide.bullets = []
      }
    }

    return parsed
  } catch (error) {
    console.error('Failed to parse outline JSON:', error)
    console.error('Raw response:', content)
    throw new Error(`Failed to parse outline: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Extract text from image using OpenRouter Vision model
 * Tries multiple models, prioritizing free/cheap options first
 * Note: Some models require credits. Check OpenRouter pricing.
 */
export async function extractTextFromImage(imageUrl: string): Promise<string> {
  const messages: OpenRouterMessage[] = [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: 'Extract all text content from this image. Preserve the structure, bullet points, and formatting. Return only the extracted text, no explanations.',
        },
        {
          type: 'image_url',
          image_url: { url: imageUrl },
        },
      ],
    },
  ]

  // Try different vision models - OpenRouter supports multiple
  // Use correct model IDs - check OpenRouter docs for current list
  let response
  let lastError: Error | null = null
  
  // Correct OpenRouter vision model IDs (prioritize cheaper options)
  // Note: Many vision models require credits - user needs to purchase credits
  const visionModels = [
    'google/gemini-flash-1.5-8b',  // Cheapest option
    'google/gemini-flash-1.5',     // Flash model
    'google/gemini-1.5-pro',       // Pro model
    'qwen/qwen-2.5-vl-7b-instruct', // Qwen vision (if available)
    'qwen/qwen-vl-max',            // Requires credits
    'anthropic/claude-3-haiku-20240307', // Cheaper Claude
    'anthropic/claude-3-sonnet-20240229', // Mid-tier Claude
  ]

  for (const model of visionModels) {
    try {
      console.log(`[OCR] Trying vision model: ${model}`)
      response = await callOpenRouter({
        model,
        messages,
        max_tokens: 2000,
        temperature: 0.2,
      })
      console.log(`[OCR] Success with model: ${model}`)
      break
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.warn(`[OCR] Model ${model} failed:`, lastError.message)
      continue
    }
  }

  if (!response) {
    throw new Error(`All vision models failed. Last error: ${lastError?.message || 'Unknown error'}`)
  }

  return response.choices[0]?.message?.content || ''
}

/**
 * Chunk text for processing (splits into manageable sizes)
 */
export function chunkText(text: string, maxChunkSize: number = 3000): string[] {
  const chunks: string[] = []
  const paragraphs = text.split(/\n\s*\n/)

  let currentChunk = ''

  for (const paragraph of paragraphs) {
    if ((currentChunk + paragraph).length <= maxChunkSize) {
      currentChunk += paragraph + '\n\n'
    } else {
      if (currentChunk) {
        chunks.push(currentChunk.trim())
      }
      currentChunk = paragraph + '\n\n'
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim())
  }

  return chunks.length > 0 ? chunks : [text]
}

