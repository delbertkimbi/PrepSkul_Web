/**
 * TichaAI Presentation Generation API
 * End-to-end pipeline: File → Extract → Clean → Outline → PPT → Storage
 */

import { NextRequest, NextResponse } from 'next/server'
import { extractFile } from '@/lib/ticha/extract'
import { cleanText, generateOutline, chunkText } from '@/lib/ticha/openrouter'
import { createPPT, type SlideData } from '@/lib/ticha/ppt/createPPT'
import {
  downloadFileFromStorage,
  uploadFileToStorage,
  tichaSupabaseAdmin,
} from '@/lib/ticha/supabase-service'
import { getTichaServerSession } from '@/lib/ticha-supabase-server'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const MAX_PROCESSING_TIME = 60000 // 60 seconds

interface GenerateRequest {
  fileUrl: string
  prompt?: string
  userId?: string
}

/**
 * POST /api/ticha/generate
 * Generate presentation from uploaded file
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Parse request
    const body: GenerateRequest = await request.json()
    const { fileUrl, prompt, userId, designPreset, customDesignPrompt } = body

    if (!fileUrl) {
      return NextResponse.json(
        { error: 'fileUrl is required' },
        { status: 400 }
      )
    }

    // Extract file path from URL
    // fileUrl format: https://...supabase.co/storage/v1/object/public/uploads/path/to/file.pdf
    const urlMatch = fileUrl.match(/\/uploads\/(.+)$/)
    if (!urlMatch) {
      return NextResponse.json(
        { error: 'Invalid fileUrl format' },
        { status: 400 }
      )
    }

    // The path already includes the full path within the bucket (e.g., "public/1763619499405-reqyip.png")
    // Don't prepend "uploads/" as it's the bucket name, not part of the path
    const filePath = urlMatch[1]

    console.log(`[Generate] Starting generation for file: ${filePath}`)

    // Get user session if available
    let sessionUserId: string | undefined
    try {
      const session = await getTichaServerSession()
      sessionUserId = session?.user?.id
    } catch (error) {
      console.log(`[Generate] No session found, continuing without user`)
    }

    // Use provided userId or session userId
    const finalUserId = userId || sessionUserId

    // Step 1: Download file from Storage
    console.log(`[Generate] Step 1: Downloading file...`)
    let fileBuffer: Buffer
    let mimeType: string

    try {
      fileBuffer = await downloadFileFromStorage('uploads', filePath)

      // Get file metadata
      const { data: fileData } = await tichaSupabaseAdmin.storage
        .from('uploads')
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
      console.error(`[Generate] Failed to download file:`, error)
      return NextResponse.json(
        { error: `Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}` },
        { status: 500 }
      )
    }

    // Step 2: Extract text from file
    console.log(`[Generate] Step 2: Extracting text...`)
    let extractedContent
    try {
      extractedContent = await extractFile(fileBuffer, mimeType)
      console.log(`[Generate] Extracted ${extractedContent.text.length} characters using ${extractedContent.method}`)
    } catch (error) {
      console.error(`[Generate] Failed to extract text:`, error)
      return NextResponse.json(
        { error: `Failed to extract text: ${error instanceof Error ? error.message : 'Unsupported file type'}` },
        { status: 400 }
      )
    }

    if (!extractedContent.text || extractedContent.text.trim().length < 50) {
      return NextResponse.json(
        { error: 'Extracted text is too short. Please ensure the file contains readable text.' },
        { status: 400 }
      )
    }

    // Step 3: Clean text with AI
    console.log(`[Generate] Step 3: Cleaning text...`)
    let cleanedText: string
    try {
      // Chunk text if too long
      const chunks = chunkText(extractedContent.text, 3000)
      
      const cleanedChunks = await Promise.all(
        chunks.map(chunk => cleanText(chunk))
      )

      cleanedText = cleanedChunks.join('\n\n')
      console.log(`[Generate] Cleaned text: ${cleanedText.length} characters`)
    } catch (error) {
      console.error(`[Generate] Failed to clean text:`, error)
      // Continue with original text if cleaning fails
      cleanedText = extractedContent.text
      console.warn(`[Generate] Using original text due to cleaning failure`)
    }

    // Step 4: Generate outline with design specifications
    console.log(`[Generate] Step 4: Generating outline with design specs...`)
    let outline
    try {
      outline = await generateOutline(cleanedText, prompt, {
        designPreset,
        customDesignPrompt,
      })
      console.log(`[Generate] Generated ${outline.slides.length} slides`)
    } catch (error) {
      console.error(`[Generate] Failed to generate outline:`, error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      // Check if it's a credits issue
      if (errorMessage.includes('402') || errorMessage.includes('credits') || errorMessage.includes('Insufficient credits')) {
        return NextResponse.json(
          { error: 'OpenRouter credits required. Please purchase credits at https://openrouter.ai/settings/credits to generate presentations. Minimum $10 recommended for testing.' },
          { status: 402 }
        )
      }
      
      return NextResponse.json(
        { error: `Failed to generate outline: ${errorMessage}` },
        { status: 500 }
      )
    }

    if (!outline.slides || outline.slides.length === 0) {
      return NextResponse.json(
        { error: 'Failed to generate slides. Please try again.' },
        { status: 500 }
      )
    }

    // Step 5: Create PowerPoint presentation
    console.log(`[Generate] Step 5: Creating PowerPoint...`)
    let pptBuffer: Buffer
    try {
      pptBuffer = await createPPT({
        title: prompt ? `Presentation: ${prompt.substring(0, 50)}` : 'TichaAI Presentation',
        author: userId || 'TichaAI User',
        company: 'TichaAI',
        slides: outline.slides as SlideData[],
      })
      console.log(`[Generate] Created PPT: ${pptBuffer.length} bytes`)
    } catch (error) {
      console.error(`[Generate] Failed to create PPT:`, error)
      return NextResponse.json(
        { error: `Failed to create presentation: ${error instanceof Error ? error.message : 'Unknown error'}` },
        { status: 500 }
      )
    }

    // Step 6: Upload PPT to Storage
    console.log(`[Generate] Step 6: Uploading to Storage...`)
    let pptUrl: string
    try {
      const timestamp = Date.now()
      const pptFileName = `presentation-${timestamp}.pptx`
      const pptPath = `${userId || 'public'}/${pptFileName}`

      const { url } = await uploadFileToStorage(
        'generated',
        pptPath,
        pptBuffer,
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      )

      pptUrl = url
      console.log(`[Generate] Uploaded PPT: ${pptUrl}`)
    } catch (error) {
      console.error(`[Generate] Failed to upload PPT:`, error)
      return NextResponse.json(
        { error: `Failed to upload presentation: ${error instanceof Error ? error.message : 'Unknown error'}` },
        { status: 500 }
      )
    }

    // Step 7: Create database record (optional)
    // Prepare presentation data for storage
    const presentationData = {
      id: '', // Will be set by database
      title: prompt ? `Presentation: ${prompt.substring(0, 50)}` : 'TichaAI Presentation',
      author: userId || 'TichaAI User',
      company: 'TichaAI',
      slides: outline.slides.map((slide, index) => ({
        id: `slide-${index + 1}`,
        slide_number: index + 1,
        slide_title: slide.slide_title,
        bullets: slide.bullets,
        design: slide.design,
      })),
      metadata: {
        version: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    }

    // Always create database record (even without userId for anonymous users)
    try {
      const insertData: any = {
        title: prompt || 'Untitled Presentation',
        description: `Generated from ${filePath.split('/').pop()}`,
        file_url: fileUrl,
        presentation_url: pptUrl,
        presentation_data: presentationData,
        refinement_history: [],
        status: 'completed',
        completed_at: new Date().toISOString(),
      }

      // Only add user_id if we have one
      if (finalUserId) {
        insertData.user_id = finalUserId
      } else {
        // For anonymous users, we need to handle this differently
        // Check if user_id can be nullable, if not, create a placeholder user
        insertData.user_id = null // This will work if user_id is nullable, otherwise we need a default user
      }

      const { data: insertedData, error: dbError } = await tichaSupabaseAdmin
        .from('ticha_presentations')
        .insert(insertData)
        .select('id')
        .single()

      if (dbError) {
        console.warn(`[Generate] Failed to create DB record:`, dbError)
        // Try without user_id if it failed
        if (dbError.code === '23503' && finalUserId) { // Foreign key constraint
          const { data: retryData, error: retryError } = await tichaSupabaseAdmin
            .from('ticha_presentations')
            .insert({
              ...insertData,
              user_id: null,
            })
            .select('id')
            .single()
          
          if (!retryError && retryData) {
            presentationData.id = retryData.id
          }
        }
      } else if (insertedData) {
        // Update presentation data with actual ID
        presentationData.id = insertedData.id
      }
    } catch (dbError) {
      console.warn(`[Generate] DB record creation error:`, dbError)
      // Continue anyway - presentation is still generated
    }

    const processingTime = Date.now() - startTime
    console.log(`[Generate] Success! Processing time: ${processingTime}ms`)

    // Return success response
    return NextResponse.json({
      success: true,
      downloadUrl: pptUrl,
      slides: outline.slides.length,
      slidesData: presentationData.slides, // Return slides for viewer
      processingTime: `${(processingTime / 1000).toFixed(2)}s`,
      presentationId: presentationData.id || null,
      presentationData: presentationData.id ? presentationData : null,
    })

  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error(`[Generate] Unexpected error (${processingTime}ms):`, error)

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

