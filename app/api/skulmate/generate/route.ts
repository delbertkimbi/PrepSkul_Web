/**
 * skulMate Game Generation API
 * Converts notes/documents into interactive games (quiz, flashcards, matching, fill-in-the-blank)
 */

import { NextRequest, NextResponse } from 'next/server'
import { extractFile } from '@/lib/ticha/extract'
import { callOpenRouterWithKey } from '@/lib/ticha/openrouter'
import {
  downloadFileFromStorage,
  tichaSupabaseAdmin,
} from '@/lib/ticha/supabase-service'
import { getTichaServerSession } from '@/lib/ticha-supabase-server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const MAX_PROCESSING_TIME = 60000 // 60 seconds

/**
 * Get skulMate OpenRouter API key
 */
function getSkulMateApiKey(): string {
  const key = process.env.SKULMATE_OPENROUTER_API_KEY
  if (!key) {
    throw new Error('Missing SKULMATE_OPENROUTER_API_KEY environment variable')
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

  try {
    // Use skulMate-specific API key for usage tracking
    const skulMateApiKey = getSkulMateApiKey()
    const response = await callOpenRouterWithKey(skulMateApiKey, {
      model: 'openai/gpt-4o-mini', // Using cheaper model for games
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    })

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

    const gameData: GameData = JSON.parse(jsonContent)
    
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
  } catch (error) {
    console.error('[skulMate] AI generation error:', error)
    throw new Error(`Failed to generate game: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * POST /api/skulmate/generate
 * Generate game from uploaded file or text input
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Parse request
    const body: GenerateRequest = await request.json()
    const { fileUrl, text, userId, childId, gameType = 'auto' } = body

    if (!fileUrl && !text) {
      return NextResponse.json(
        { error: 'Either fileUrl or text is required' },
        { status: 400 }
      )
    }

    if (text && text.trim().length < 50) {
      return NextResponse.json(
        { error: 'Text must be at least 50 characters long' },
        { status: 400 }
      )
    }

    // Get user session if available
    let sessionUserId: string | undefined
    try {
      const session = await getTichaServerSession()
      sessionUserId = session?.user?.id
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
              { status: 400 }
            )
          }
        }
      }

      console.log(`[skulMate] Extracted bucket: ${bucket}, path: ${filePath}`)

      // Download file from Storage
      let fileBuffer: Buffer
      let mimeType: string

      try {
        fileBuffer = await downloadFileFromStorage(bucket, filePath)

        const { data: fileData } = await tichaSupabaseAdmin.storage
          .from(bucket)
          .list(filePath.split('/').slice(0, -1).join('/'), {
            limit: 1,
            search: filePath.split('/').pop() || '',
          })

        mimeType = fileData?.[0]?.metadata?.mimetype || 'application/octet-stream'

        if (fileBuffer.length > MAX_FILE_SIZE) {
          return NextResponse.json(
            { error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB` },
            { status: 400 }
          )
        }
      } catch (error) {
        console.error('[skulMate] Failed to download file:', error)
        return NextResponse.json(
          { error: `Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}` },
          { status: 500 }
        )
      }

      // Extract text from file
      console.log('[skulMate] Step 2: Extracting text...')
      try {
        const extractedContent = await extractFile(fileBuffer, mimeType)
        extractedText = extractedContent.text
        console.log(`[skulMate] Extracted ${extractedText.length} characters`)
      } catch (error) {
        console.error('[skulMate] Failed to extract text:', error)
        return NextResponse.json(
          { error: `Failed to extract text: ${error instanceof Error ? error.message : 'Unsupported file type'}` },
          { status: 400 }
        )
      }

      if (!extractedText || extractedText.trim().length < 50) {
        return NextResponse.json(
          { error: 'Extracted text is too short. Please ensure the file contains readable text.' },
          { status: 400 }
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
          .single()

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
    })
  } catch (error: any) {
    console.error('[skulMate] Error:', error)
    
    // Check if it's a credits issue
    if (error.message?.includes('402') || error.message?.includes('credits') || error.message?.includes('Insufficient credits')) {
      return NextResponse.json(
        { error: 'OpenRouter credits required. Please purchase credits at https://openrouter.ai/settings/credits to generate games. Minimum $10 recommended for testing.' },
        { status: 402 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to generate game' },
      { status: 500 }
    )
  }
}

