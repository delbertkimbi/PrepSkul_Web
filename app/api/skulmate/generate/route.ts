/**
 * skulMate Game Generation API
 * Converts notes/documents into interactive games (quiz, flashcards, matching, fill-in-the-blank)
 */

import { NextRequest, NextResponse } from 'next/server'
import { extractFile } from '@/lib/skulmate/extract'
import { callOpenRouterWithKey } from '@/lib/ticha/openrouter'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const MAX_PROCESSING_TIME = 60000 // 60 seconds

/**
 * Download file from Supabase Storage using the signed/public URL
 * This avoids needing service role key - we just fetch the file via HTTP
 */
async function downloadFileFromUrl(fileUrl: string): Promise<Buffer> {
  // #region agent log
  const logDebug = (location: string, message: string, data: any) => {
    fetch('http://127.0.0.1:7242/ingest/7b5e5a52-47e1-4b45-99f3-6240f3527478', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location,
        message,
        data,
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
      }),
    }).catch(() => {});
  };
  
  logDebug('skulmate/generate:downloadFileFromUrl', 'Starting download', {
    fileUrlLength: fileUrl.length,
    fileUrlPrefix: fileUrl.substring(0, 100),
    isSignedUrl: fileUrl.includes('token='),
    isPublicUrl: fileUrl.includes('/public/'),
  });
  // #endregion
  
  console.log(`[skulMate Storage] Downloading file from URL: ${fileUrl.substring(0, 100)}...`)
  
  try {
    // #region agent log
    logDebug('skulmate/generate:downloadFileFromUrl', 'Before fetch', {
      url: fileUrl.substring(0, 150),
    });
    // #endregion
    
    const response = await fetch(fileUrl)
    
    // #region agent log
    logDebug('skulmate/generate:downloadFileFromUrl', 'Fetch response received', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      contentType: response.headers.get('content-type'),
      contentLength: response.headers.get('content-length'),
    });
    // #endregion
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Could not read error response')
      // #region agent log
      logDebug('skulmate/generate:downloadFileFromUrl', 'Fetch failed', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText.substring(0, 200),
      });
      // #endregion
      throw new Error(`Failed to download file: HTTP ${response.status} ${response.statusText}. ${errorText.substring(0, 100)}`)
    }
    
    const arrayBuffer = await response.arrayBuffer()
    
    // #region agent log
    logDebug('skulmate/generate:downloadFileFromUrl', 'Download succeeded', {
      bufferSize: arrayBuffer.byteLength,
    });
    // #endregion
    
    return Buffer.from(arrayBuffer)
  } catch (error) {
    // #region agent log
    logDebug('skulmate/generate:downloadFileFromUrl', 'Download error caught', {
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack?.substring(0, 300) : undefined,
    });
    // #endregion
    
    console.error(`[skulMate Storage] Download error:`, error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to download file from URL: ${errorMessage}`)
  }
}

/**
 * Get skulMate OpenRouter API key
 * Falls back to OPENROUTER_API_KEY if SKULMATE_OPENROUTER_API_KEY is not set
 */
function getSkulMateApiKey(): string {
  const key = process.env.SKULMATE_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY
  if (!key) {
    throw new Error('Missing SKULMATE_OPENROUTER_API_KEY or OPENROUTER_API_KEY environment variable')
  }
  return key
}

interface GenerateRequest {
  fileUrl?: string
  text?: string
  userId?: string
  childId?: string // For parents creating games for children
  gameType?: 'quiz' | 'flashcards' | 'matching' | 'fill_blank' | 'auto' // auto = AI decides
}

interface GameItem {
  question?: string
  term?: string // For flashcards
  definition?: string // For flashcards
  options?: string[] // For quiz
  correctAnswer?: number | string // For quiz and fill_blank
  explanation?: string
  leftItem?: string // For matching
  rightItem?: string // For matching
  blankText?: string // For fill_blank
}

interface GameData {
  gameType: string
  title: string
  items: GameItem[]
  metadata: {
    source: string
    generatedAt: string
    difficulty: 'easy' | 'medium' | 'hard'
    totalItems: number
  }
}

/**
 * Generate game content using AI
 * Uses model fallback chain - tries cheaper models first
 */
async function generateGameContent(
  text: string,
  gameType: string
): Promise<GameData> {
  const systemPrompt = `You are an educational game generator. Convert the provided notes/text into an interactive learning game.

Game Types:
- quiz: Multiple choice questions with 4 options each
- flashcards: Term-definition pairs
- matching: Pairs of related concepts
- fill_blank: Fill-in-the-blank sentences

Generate engaging, educational content that helps students learn effectively.`;

  const userPrompt = `Convert the following notes into a ${gameType === 'auto' ? 'suitable interactive game (choose the best type)' : gameType} game:

${text}

Requirements:
${gameType === 'quiz' || gameType === 'auto' ? '- Generate 10-15 multiple choice questions\n- Each question should have 4 options\n- Include correct answer and brief explanation' : ''}
${gameType === 'flashcards' || gameType === 'auto' ? '- Generate 15-20 term-definition pairs\n- Terms should be key concepts\n- Definitions should be clear and educational' : ''}
${gameType === 'matching' || gameType === 'auto' ? '- Generate 10-12 matching pairs\n- Pairs should be related concepts\n- Make it educational and challenging' : ''}
${gameType === 'fill_blank' || gameType === 'auto' ? '- Generate 10-15 fill-in-the-blank sentences\n- Remove key terms/concepts\n- Provide correct answers' : ''}

Return ONLY valid JSON in this format:
{
  "gameType": "${gameType === 'auto' ? 'quiz|flashcards|matching|fill_blank' : gameType}",
  "title": "Game title based on content",
  "items": [
    ${gameType === 'quiz' || gameType === 'auto' ? '{"question": "...", "options": ["...", "...", "...", "..."], "correctAnswer": 0, "explanation": "..."}' : ''}
    ${gameType === 'flashcards' || gameType === 'auto' ? '{"term": "...", "definition": "..."}' : ''}
    ${gameType === 'matching' || gameType === 'auto' ? '{"leftItem": "...", "rightItem": "..."}' : ''}
    ${gameType === 'fill_blank' || gameType === 'auto' ? '{"blankText": "...", "correctAnswer": "..."}' : ''}
  ],
  "metadata": {
    "difficulty": "easy|medium|hard",
    "totalItems": number
  }
}`;

  // Try multiple models - prioritize free/cheap models first
  const gameModels = [
    'qwen/qwen-2-7b-instruct',      // Free/cheap
    'qwen/qwen-2-14b-instruct',     // Slightly more expensive
    'meta-llama/llama-3.2-3b-instruct', // Free tier
    'mistralai/mistral-7b-instruct', // Cheap
    'google/gemini-flash-1.5',       // Google model
    'openai/gpt-4o-mini',            // OpenAI (fallback)
  ]

  const skulMateApiKey = getSkulMateApiKey()
  let response
  let lastError: Error | null = null

  for (const model of gameModels) {
    try {
      console.log(`[skulMate] Trying model: ${model}`)
      response = await callOpenRouterWithKey(skulMateApiKey, {
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: 'json_object' }, // Request JSON format
      })
      console.log(`[skulMate] Success with model: ${model}`)
      break
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.warn(`[skulMate] Model ${model} failed:`, lastError.message)
      
      // If it's a credits error, stop trying (all will fail)
      if (lastError.message.includes('402') || lastError.message.includes('credits')) {
        throw new Error('OpenRouter credits required. Please purchase credits at https://openrouter.ai/settings/credits')
      }
      continue
    }
  }

  if (!response) {
    throw new Error(`Failed to generate game. All models failed. Last error: ${lastError?.message || 'Unknown error'}`)
  }

  if (!response.choices || response.choices.length === 0) {
    throw new Error('No response from AI')
  }

  const content = response.choices[0].message?.content || ''
  
  // Extract JSON from response (handle markdown code blocks)
  let jsonContent = content.trim()
  if (jsonContent.startsWith('```')) {
    jsonContent = jsonContent.replace(/^```json\n?/, '').replace(/\n?```$/, '')
  }
  if (jsonContent.startsWith('```')) {
    jsonContent = jsonContent.replace(/^```\n?/, '').replace(/\n?```$/, '')
  }

  let gameData: GameData
  try {
    gameData = JSON.parse(jsonContent)
  } catch (parseError) {
    console.error('[skulMate] JSON parse error:', parseError)
    console.error('[skulMate] Raw content:', jsonContent.substring(0, 500))
    throw new Error(`Failed to parse game data: ${parseError instanceof Error ? parseError.message : 'Invalid JSON'}`)
  }
  
  // Validate game data
  if (!gameData.gameType || !gameData.items || gameData.items.length === 0) {
    throw new Error('Invalid game data structure')
  }

  // Add metadata
  gameData.metadata = {
    ...gameData.metadata,
    source: 'document',
    generatedAt: new Date().toISOString(),
    totalItems: gameData.items.length,
  }

  return gameData
}

/**
 * POST /api/skulmate/generate
 * Generate game from uploaded file or text input
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  // #region agent log
  const logDebug = (location: string, message: string, data: any) => {
    fetch('http://127.0.0.1:7242/ingest/7b5e5a52-47e1-4b45-99f3-6240f3527478', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location,
        message,
        data,
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
      }),
    }).catch(() => {});
  };
  
  logDebug('skulmate/generate/route.ts:POST', 'API route entry', {
    hasNextPublicSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasSkulMateApiKey: !!process.env.SKULMATE_OPENROUTER_API_KEY,
  });
  // #endregion

  // Handle CORS for Flutter Web
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  
  console.log('[skulMate] POST request received')
  console.log('[skulMate] Origin:', origin || 'none')
  console.log('[skulMate] Referer:', referer || 'none')
  console.log('[skulMate] User-Agent:', request.headers.get('user-agent') || 'none')
  
  // CORS headers - when using credentials, must specify exact origin (not *)
  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400', // Cache preflight for 24 hours
  }
  
  // Set origin - if credentials are needed, use specific origin; otherwise allow all
  if (origin) {
    corsHeaders['Access-Control-Allow-Origin'] = origin
    corsHeaders['Access-Control-Allow-Credentials'] = 'true'
    console.log('[skulMate] CORS: Allowing origin with credentials:', origin)
  } else {
    // No origin header (e.g., same-origin request) - allow all
    corsHeaders['Access-Control-Allow-Origin'] = '*'
    console.log('[skulMate] CORS: No origin header, allowing all origins')
  }

  try {
    // Parse request
    const body: GenerateRequest = await request.json()
    const { fileUrl, text, userId, childId, gameType = 'auto' } = body

    if (!fileUrl && !text) {
      return NextResponse.json(
        { error: 'Either fileUrl or text is required' },
        { status: 400, headers: corsHeaders }
      )
    }

    if (text && text.trim().length < 50) {
      return NextResponse.json(
        { error: 'Text must be at least 50 characters long' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Get user session from main Supabase (not Ticha)
    let sessionUserId: string | undefined
    try {
      const supabase = await createServerSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      sessionUserId = user?.id
    } catch (error) {
      console.log('[skulMate] No session found, continuing without user')
    }

    const finalUserId = userId || sessionUserId

    let extractedText = text || ''

    // If fileUrl provided, download and extract text
    if (fileUrl) {
      console.log('[skulMate] Step 1: Downloading file...')
      
      // Extract bucket and file path from Supabase Storage URL
      // Supports both signed URLs: /storage/v1/object/sign/{bucket}/{path}?token=...
      // and public URLs: /storage/v1/object/public/{bucket}/{path}
      let bucket: string
      let filePath: string

      // Try to match signed URL format
      const signedUrlMatch = fileUrl.match(/\/storage\/v1\/object\/sign\/([^\/]+)\/(.+?)(?:\?|$)/)
      if (signedUrlMatch) {
        bucket = signedUrlMatch[1]
        filePath = signedUrlMatch[2]
      } else {
        // Try to match public URL format
        const publicUrlMatch = fileUrl.match(/\/storage\/v1\/object\/public\/([^\/]+)\/(.+?)(?:\?|$)/)
        if (publicUrlMatch) {
          bucket = publicUrlMatch[1]
          filePath = publicUrlMatch[2]
        } else {
          // Fallback: try old format /uploads/...
          const legacyMatch = fileUrl.match(/\/uploads\/(.+)$/)
          if (legacyMatch) {
            bucket = 'uploads'
            filePath = legacyMatch[1]
          } else {
            return NextResponse.json(
              { error: 'Invalid fileUrl format. Expected Supabase Storage URL.' },
              { status: 400, headers: corsHeaders }
            )
          }
        }
      }

      console.log(`[skulMate] Extracted bucket: ${bucket}, path: ${filePath}`)

      // Download file from Storage using the URL directly (no service role key needed)
      let fileBuffer: Buffer
      let mimeType: string

      try {
        // #region agent log
        logDebug('skulmate/generate/route.ts:download', 'Before downloadFileFromUrl', {
          fileUrl: fileUrl.substring(0, 100),
          bucket,
          filePath,
        });
        // #endregion
        
        // Download file directly from the signed/public URL (uses main Supabase, not Ticha)
        // This avoids needing service role key - the URL already has access token
        fileBuffer = await downloadFileFromUrl(fileUrl)
        
        // #region agent log
        logDebug('skulmate/generate/route.ts:download', 'downloadFileFromUrl succeeded', {
          bufferSize: fileBuffer.length,
        });
        // #endregion

        // Determine MIME type from file extension or URL
        const urlLower = fileUrl.toLowerCase()
        if (urlLower.includes('.pdf')) {
          mimeType = 'application/pdf'
        } else if (urlLower.includes('.png')) {
          mimeType = 'image/png'
        } else if (urlLower.includes('.jpg') || urlLower.includes('.jpeg')) {
          mimeType = 'image/jpeg'
        } else if (urlLower.includes('.docx')) {
          mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        } else {
          mimeType = 'application/octet-stream'
        }

        if (fileBuffer.length > MAX_FILE_SIZE) {
          return NextResponse.json(
            { error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB` },
            { status: 400, headers: corsHeaders }
          )
        }
      } catch (error) {
        console.error('[skulMate] Failed to download file:', error)
        return NextResponse.json(
          { error: `Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}` },
          { status: 500, headers: corsHeaders }
        )
      }

      // Extract text from file
      console.log('[skulMate] Step 2: Extracting text...')
      try {
        // Extract using skulMate-specific extraction (uses ONLY main Supabase, not Ticha)
        const extractedContent = await extractFile(fileBuffer, mimeType)
        extractedText = extractedContent.text
        console.log(`[skulMate] Extracted ${extractedText.length} characters using ${extractedContent.method}`)
      } catch (error) {
        console.error('[skulMate] Failed to extract text:', error)
        return NextResponse.json(
          { error: `Failed to extract text: ${error instanceof Error ? error.message : 'Unsupported file type'}` },
          { status: 400, headers: corsHeaders }
        )
      }

      if (!extractedText || extractedText.trim().length < 50) {
        return NextResponse.json(
          { error: 'Extracted text is too short. Please ensure the file contains readable text.' },
          { status: 400, headers: corsHeaders }
        )
      }
    }

    // Generate game content
    console.log('[skulMate] Step 3: Generating game...')
    const gameData = await generateGameContent(extractedText, gameType)

    // Save to database if userId provided
    let gameId: string | null = null
    if (finalUserId) {
      try {
        const supabase = await createServerSupabaseClient()
        
        // Insert game metadata
        const { data: game, error: gameError } = await supabase
          .from('skulmate_games')
          .insert({
            user_id: finalUserId,
            child_id: childId || null,
            title: gameData.title,
            game_type: gameData.gameType,
            document_url: fileUrl || null,
            source_type: fileUrl ? (fileUrl.endsWith('.pdf') ? 'pdf' : 'image') : 'text',
          })
          .select()
          .maybeSingle()

        if (gameError) {
          console.error('[skulMate] Failed to save game:', gameError)
          // Continue without saving to DB
        } else {
          gameId = game.id

          // Insert game data
          await supabase
            .from('skulmate_game_data')
            .insert({
              game_id: gameId,
              game_content: gameData.items,
              metadata: gameData.metadata,
            })
        }
      } catch (error) {
        console.error('[skulMate] Failed to save to database:', error)
        // Continue without saving to DB
      }
    }

    const processingTime = Date.now() - startTime
    console.log(`[skulMate] Game generated in ${processingTime}ms`)

    return NextResponse.json({
      success: true,
      game: {
        id: gameId,
        ...gameData,
      },
      processingTime,
    }, { headers: corsHeaders })
  } catch (error: any) {
    console.error('[skulMate] Error:', error)
    
    // Check if it's a credits issue
    if (error.message?.includes('402') || error.message?.includes('credits') || error.message?.includes('Insufficient credits')) {
      return NextResponse.json(
        { error: 'OpenRouter credits required. Please purchase credits at https://openrouter.ai/settings/credits to generate games. Minimum $10 recommended for testing.' },
        { status: 402, headers: corsHeaders }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to generate game' },
      { status: 500, headers: corsHeaders }
    )
  }
}

/**
 * OPTIONS /api/skulmate/generate
 * Handle CORS preflight requests
 */
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin')
  const requestedMethod = request.headers.get('access-control-request-method')
  const requestedHeaders = request.headers.get('access-control-request-headers')
  
  console.log('[skulMate] OPTIONS preflight request received')
  console.log('[skulMate] Origin:', origin || 'none')
  console.log('[skulMate] Requested method:', requestedMethod || 'none')
  console.log('[skulMate] Requested headers:', requestedHeaders || 'none')
  
  // CORS headers - when using credentials, must specify exact origin (not *)
  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400', // Cache preflight for 24 hours
  }
  
  // Set origin - if credentials are needed, use specific origin; otherwise allow all
  if (origin) {
    corsHeaders['Access-Control-Allow-Origin'] = origin
    corsHeaders['Access-Control-Allow-Credentials'] = 'true'
    console.log('[skulMate] CORS preflight: Allowing origin with credentials:', origin)
  } else {
    // No origin header (e.g., same-origin request) - allow all
    corsHeaders['Access-Control-Allow-Origin'] = '*'
    console.log('[skulMate] CORS preflight: No origin header, allowing all origins')
  }
  
  console.log('[skulMate] CORS headers:', corsHeaders)
  
  return new NextResponse(null, { 
    status: 204,
    headers: corsHeaders 
  })
}

