/**
 * OpenRouter API Client for Tichar AI
 * Handles all AI model interactions with design-focused prompts
 */

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'


/**
 * Get OpenRouter API key (lazy evaluation to avoid build-time errors)
 */
function getOpenRouterApiKey(): string {
  const key = process.env.OPENROUTER_API_KEY
  if (!key) {
    throw new Error('Missing OPENROUTER_API_KEY environment variable')
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
 * Call OpenRouter API
 */
async function callOpenRouter(options: OpenRouterOptions): Promise<OpenRouterResponse> {

  const apiKey = getOpenRouterApiKey()

  //const apiKey = process.env.OPENROUTER_API_KEY
  
  if (!apiKey) {
    throw new Error('Missing OPENROUTER_API_KEY environment variable')
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
  const systemPrompt = `You are an expert presentation designer specializing in creating visually compelling and well-structured slide presentations.

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
- **light-blue**: Modern purple-blue gradient (#667eea to #764ba2) - Friendly, professional, modern, WOW factor
- **dark-blue**: Deep professional blue gradient (#1e3c72 to #2a5298) - Authoritative, trustworthy, serious topics
- **white**: Soft elegant gradient (#f5f7fa to #c3cfe2) - Clean, minimalist, sophisticated
- **gray**: Elegant gray gradient (#e0e0e0 to #bdbdbd) - Neutral, balanced, corporate excellence
- **green**: Modern teal-green gradient (#11998e to #38ef7d) - Growth, success, positive outcomes, vibrant

ICON SELECTION (use sparingly):
- **none**: Clean, text-focused slides
- **book**: Educational content, references, learning
- **idea**: Innovation, concepts, brainstorming
- **warning**: Important notices, cautions, attention
- **check**: Accomplishments, success, completion

OUTPUT FORMAT:
Return a JSON object with this exact structure:
{
  "slides": [
    {
      "slide_title": "Slide Title Here",
      "bullets": ["Bullet point 1", "Bullet point 2", ...],
      "design": {
        "background_color": "light-blue | dark-blue | white | gray | green",
        "text_color": "black | white",
        "layout": "title-only | title-and-bullets | two-column | image-left | image-right",
        "icon": "none | book | idea | warning | check"
      }
    }
  ]
}

GUIDELINES:
- Create 5-12 slides depending on content length
- Vary layouts for visual interest (don't use same layout for all slides)
- Choose colors that enhance readability (light backgrounds = dark text, dark backgrounds = white text)
- Use icons strategically (not on every slide)
- Group related content logically
- Start with title slide, end with summary/conclusion
- Ensure bullets are concise (max 15 words each)
- Make slide titles compelling and clear`

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

