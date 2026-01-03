/**
 * AI Vision Design Extraction
 * Uses OpenRouter Vision API to extract design patterns from images
 */

import { ExtractedDesign, DesignSpec } from '../types'
import { callOpenRouter } from '../openrouter'

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
 * Call OpenRouter API (extracted from openrouter.ts for reuse)
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
 * Get ordered list of vision models for design extraction.
 * Allows overriding via TICHA_DESIGN_VISION_MODELS env (comma‑separated).
 */
function getDesignVisionModels(): string[] {
  const override = process.env.TICHA_DESIGN_VISION_MODELS
  if (override && override.trim().length > 0) {
    return override
      .split(',')
      .map((m) => m.trim())
      .filter((m) => m.length > 0)
  }

  // Default preference order – tuned for high‑quality design understanding
  return [
    'anthropic/claude-3.5-sonnet',
    'openai/gpt-4o',
    'openai/gpt-4-vision-preview',
    'google/gemini-pro-vision',
    'anthropic/claude-3-opus',
  ]
}

/**
 * Extract design patterns from an image using AI vision
 */
export async function extractDesignFromImage(
  imageUrl: string,
  keywords: string[] = []
): Promise<ExtractedDesign> {
  const systemPrompt = `You are an expert presentation design analyst. Your task is to analyze a slide design image and extract detailed design specifications with EXTREME PRECISION.

CRITICAL REQUIREMENTS:
- Extract EXACT hex color codes from the image (use color picker tools if available, or estimate as accurately as possible)
- Identify fonts by name if possible, or describe them accurately (e.g., "Montserrat", "Open Sans", "Roboto", "sans-serif bold")
- Estimate font sizes accurately in pixels (common sizes: 48-72 for titles, 24-32 for subtitles, 16-20 for body text)
- Be precise - this data will be used to recreate the exact design

Analyze the image and extract:
1. **Color Palette**: Identify ALL colors visible in the design:
   - Primary background color (main background) - provide hex code
   - Secondary background colors (if gradients or multiple backgrounds)
   - Text colors (title text, body text) - provide hex codes
   - Accent colors (highlights, shapes, decorative elements) - provide hex codes
   - If gradients are present, extract the start and end colors
   - Order colors by prominence (most used first)
2. **Typography**: 
   - Font names (if recognizable: Montserrat, Open Sans, Roboto, Poppins, Inter, Arial, Helvetica, etc.)
   - If font name is unclear, describe it accurately (e.g., "bold sans-serif", "thin modern sans-serif")
   - Font sizes in pixels (estimate carefully - look at title vs body text size difference)
   - Font weights (normal, bold, 300, 400, 600, 700, etc.)
   - List fonts in order: [title font, body font, accent font if different]
3. **Layout Pattern**: Identify the exact layout:
   - "title-only" if only title is visible
   - "title-and-bullets" if title with bullet points
   - "two-column" if content is in two columns
   - "image-left" or "image-right" if image is prominent
   - Or describe custom layouts accurately
4. **Spacing**: Estimate margins and padding (in pixels)
5. **Style Keywords**: Identify design characteristics:
   - Style: "modern", "minimalist", "corporate", "creative", "bold", "elegant", "professional", "business", etc.
   - Mood: "serious", "friendly", "energetic", "calm", etc.
6. **Quality Score**: Rate design quality 0-100 based on:
   - Visual appeal and modern aesthetics
   - Professionalism and polish
   - Typography quality and readability
   - Color harmony and balance
   - Overall design sophistication

Return ONLY a valid JSON object (no comments, no markdown, no extra text) with this exact structure:
{
  "colorPalette": ["#hex1", "#hex2", ...],
  "typography": {
    "fonts": ["FontName1", "FontName2"],
    "sizes": [44, 32, 18, 16],
    "weights": ["normal", "bold", "300", "700"]
  },
  "layoutPattern": "title-and-bullets",
  "spacing": {
    "margins": [40, 40, 40, 40],
    "padding": [20, 20, 20, 20]
  },
  "styleKeywords": ["modern", "professional", "clean"],
  "qualityScore": 85,
  "designSpec": {
    "background_color": "#hex or predefined name",
    "text_color": "black or white",
    "layout": "title-and-bullets",
    "icon": "none",
    "fontFamily": "FontName",
    "fontSize": 18,
    "customColors": {
      "primary": "#hex",
      "secondary": "#hex",
      "accent": "#hex"
    }
  }
}

CRITICAL: Return ONLY valid JSON. Do NOT include comments (// or /* */), do NOT wrap in markdown code blocks, do NOT add explanatory text. Return pure JSON only.

Be precise and detailed. If you cannot identify specific fonts, use generic descriptions like "sans-serif", "serif", or "modern sans-serif".`

  const userMessage = keywords.length > 0
    ? `Analyze this presentation slide design. The design is tagged with these keywords: ${keywords.join(', ')}. Extract all design specifications as requested.`
    : `Analyze this presentation slide design and extract all design specifications as requested.`

  const messages: OpenRouterMessage[] = [
    {
      role: 'system',
      content: systemPrompt,
    },
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: userMessage,
        },
        {
          type: 'image_url',
          image_url: { url: imageUrl },
        },
      ],
    },
  ]

  // Try multiple vision models - prioritize best quality first
  const visionModels = getDesignVisionModels()

  let response: OpenRouterResponse | null = null
  let lastError: Error | null = null

  for (const model of visionModels) {
    try {
      console.log(`[DesignExtractor] Trying vision model: ${model}`)
      response = await callOpenRouterAPI({
        model,
        messages,
        max_tokens: 2000,
        temperature: 0.3, // Lower temperature for more consistent extraction
        response_format: { type: 'json_object' },
      })
      console.log(`[DesignExtractor] Success with model: ${model}`)
      break
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.warn(`[DesignExtractor] Model ${model} failed:`, lastError.message)
      
      // If it's a credits error, stop trying (all will fail)
      if (lastError.message.includes('402') || lastError.message.includes('credits')) {
        throw new Error('OpenRouter credits required for design extraction. Please purchase credits.')
      }
      continue
    }
  }

  if (!response) {
    throw new Error(`Failed to extract design. All models failed. Last error: ${lastError?.message || 'Unknown error'}`)
  }

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error('No content returned from design extraction')
  }

  try {
    // Clean the content - remove comments and extract JSON if wrapped in markdown
    let cleanedContent = content.trim()
    
    // Remove markdown code blocks if present
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/^```json\s*/i, '').replace(/\s*```$/i, '')
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\s*/i, '').replace(/\s*```$/i, '')
    }
    
    // Remove single-line comments (// ...)
    cleanedContent = cleanedContent.replace(/\/\/.*$/gm, '')
    
    // Remove multi-line comments (/* ... */)
    cleanedContent = cleanedContent.replace(/\/\*[\s\S]*?\*\//g, '')
    
    // Try to extract JSON object if there's extra text
    const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      cleanedContent = jsonMatch[0]
    }
    
    // Parse JSON response
    const parsed = JSON.parse(cleanedContent.trim())
    
    // Validate and normalize structure
    const extractedDesign: ExtractedDesign = {
      colorPalette: Array.isArray(parsed.colorPalette) ? parsed.colorPalette : [],
      typography: {
        fonts: Array.isArray(parsed.typography?.fonts) ? parsed.typography.fonts : ['Poppins', 'Inter'],
        sizes: Array.isArray(parsed.typography?.sizes) ? parsed.typography.sizes : [44, 32, 18, 16],
        weights: Array.isArray(parsed.typography?.weights) ? parsed.typography.weights : ['normal', 'bold'],
      },
      layoutPattern: parsed.layoutPattern || 'title-and-bullets',
      spacing: {
        margins: Array.isArray(parsed.spacing?.margins) ? parsed.spacing.margins : [40, 40, 40, 40],
        padding: Array.isArray(parsed.spacing?.padding) ? parsed.spacing.padding : [20, 20, 20, 20],
      },
      styleKeywords: Array.isArray(parsed.styleKeywords) ? parsed.styleKeywords : [],
      qualityScore: typeof parsed.qualityScore === 'number' ? Math.max(0, Math.min(100, parsed.qualityScore)) : 70,
      designSpec: parsed.designSpec || {
        background_color: parsed.colorPalette?.[0] || 'light-blue',
        text_color: 'black',
        layout: parsed.layoutPattern || 'title-and-bullets',
        icon: 'none',
      },
    }

    return extractedDesign
  } catch (error) {
    console.error('Failed to parse design extraction JSON:', error)
    console.error('Raw response:', content)
    throw new Error(`Failed to parse design extraction: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

