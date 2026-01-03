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
import { matchDesignsToPrompt, incrementDesignUsage } from '@/lib/ticha/design/matcher'
import { getActiveAggregatedDesignSet } from '@/lib/ticha/design/active-set'
import { getManualDesignSet } from '@/lib/ticha/design/manual-sets'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const MAX_PROCESSING_TIME = 60000 // 60 seconds

interface GenerateRequest {
  fileUrl: string
  prompt?: string
  userId?: string
  designPreset?: string
  customDesignPrompt?: string
  designSetId?: string
}

/**
 * POST /api/ticha/generate
 * Generate presentation from uploaded file
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Parse request with error handling for empty/invalid JSON
    let body: GenerateRequest
    try {
      const bodyText = await request.text()
      if (!bodyText || bodyText.trim() === '') {
        return NextResponse.json(
          { error: 'Request body is required' },
          { status: 400 }
        )
      }
      body = JSON.parse(bodyText)
    } catch (parseError) {
      console.error('[Generate] JSON parse error:', parseError)
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    const { fileUrl, prompt, userId, designPreset, customDesignPrompt, designSetId } = body

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

    // Step 3.5: Fetch active aggregated design set (latest admin set)
    console.log('[Generate] Step 3.5: Fetching active design set...')
    let activeDesignSet: { designSetId: string; spec: any } | null = null
    try {
      activeDesignSet = await getActiveAggregatedDesignSet()
      if (activeDesignSet) {
        console.log('[Generate] Active design set:', activeDesignSet.designSetId)
      } else {
        console.log('[Generate] No active design set found, will fall back to presets/matched designs')
      }
    } catch (e) {
      console.warn('[Generate] Failed to fetch active design set:', e)
    }

    // Step 4: Match designs to prompt (if enabled)
    console.log(`[Generate] Step 4: Matching designs to prompt...`)
    console.log(`[Generate] Prompt received: "${prompt || '(empty)'}"`)
    console.log(`[Generate] Custom design prompt: "${customDesignPrompt || '(empty)'}"`)
    
    // Combine prompt and customDesignPrompt for better matching
    const combinedPrompt = [prompt, customDesignPrompt].filter(Boolean).join(' ')
    console.log(`[Generate] Combined prompt for matching: "${combinedPrompt}"`)
    
    let matchedDesigns: any[] = []
    try {
      // If designSetId is provided, use designs from that set
      // Otherwise, match based on prompt
      if (designSetId) {
        console.log(`[Generate] Using design set: ${designSetId}`)
        // Get all designs from the set
        const { matchDesignsToPrompt } = await import('@/lib/ticha/design/matcher')
        matchedDesigns = await matchDesignsToPrompt('', cleanedText, 20, userId, designSetId)
        console.log(`[Generate] Found ${matchedDesigns.length} designs in set`)
      } else {
        matchedDesigns = await matchDesignsToPrompt(combinedPrompt || prompt || '', cleanedText, 5, userId)
        console.log(`[Generate] Matched ${matchedDesigns.length} designs`)
      }
      
      // Track usage for matched designs
      if (matchedDesigns.length > 0) {
        // Increment usage for top 3 matched designs
        const topDesigns = matchedDesigns.slice(0, 3)
        await Promise.allSettled(
          topDesigns.map(design => incrementDesignUsage(design.designId))
        )
      }
    } catch (error) {
      console.warn(`[Generate] Design matching failed, continuing without matched designs:`, error)
      // Continue without matched designs - not critical
    }

    // Step 5: Generate outline with design context (may include active design / presets)
    console.log(`[Generate] Step 5: Generating outline with design context...`)
    let outline
    try {
      outline = await generateOutline(cleanedText, prompt, {
        designPreset,
        customDesignPrompt,
        matchedDesigns: matchedDesigns.length > 0 ? matchedDesigns : undefined,
        activeDesign: activeDesignSet?.spec,
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

    // Step 5.5: Apply manual design set (fixed sequences) or use matched designs
    if (designSetId && matchedDesigns.length > 0) {
      // Use designs from the user's design set - distribute across slides
      console.log(`[Generate] Step 5.5: Using design set with ${matchedDesigns.length} designs...`)
      outline.slides = outline.slides.map((slide, index) => {
        // Cycle through matched designs
        const designIndex = index % matchedDesigns.length
        const matchedDesign = matchedDesigns[designIndex]
        const extractedDesign = matchedDesign.extractedDesign
        
        if (extractedDesign && extractedDesign.colorPalette && extractedDesign.colorPalette.length > 0) {
          // Use colors from extracted design
          const bgColor = extractedDesign.colorPalette[0].startsWith('#') 
            ? extractedDesign.colorPalette[0] 
            : `#${extractedDesign.colorPalette[0]}`
          
          // Determine text color based on background brightness
          const hex = bgColor.replace('#', '')
          const r = parseInt(hex.substring(0, 2), 16)
          const g = parseInt(hex.substring(2, 4), 16)
          const b = parseInt(hex.substring(4, 6), 16)
          const brightness = (r * 299 + g * 587 + b * 114) / 1000
          const textColor = brightness > 128 ? 'black' : 'white'
          
          // Use fonts from extracted design
          const fonts = extractedDesign.typography?.fonts || []
          const fontFamily = fonts[0] || 'Montserrat'
          const sizes = extractedDesign.typography?.sizes || []
          const fontSize = sizes[0] || (index === 0 ? 48 : 32)
          
          return {
            ...slide,
            design: {
              ...slide.design,
              background_color: bgColor,
              text_color: textColor,
              fontFamily: fontFamily,
              fontSize: fontSize,
            },
          }
        }
        return slide
      })
      console.log(`[Generate] Applied design set to ${outline.slides.length} slides`)
    } else {
      // Use manual design sets (fixed sequences) for presets
      console.log(`[Generate] Step 5.5: Applying manual design set for preset: ${designPreset || 'business'}...`)
      const preset = (designPreset === 'academic' ? 'academic' : designPreset === 'kids' ? 'kids' : 'business') as 'business' | 'academic' | 'kids'
      const manualSetId = `${preset}_v1`
      const manualSet = getManualDesignSet(manualSetId)
      
      if (manualSet && manualSet.slides && manualSet.slides.length > 0) {
        // Map generated content into fixed slide sequence
        const fixedSlides = manualSet.slides.map((templateSlide, index) => {
          // Get corresponding content from AI-generated outline
          const contentSlide = outline.slides[index] || outline.slides[outline.slides.length - 1] || {
            slide_title: '',
            bullets: [],
            design: {}
          }
          
          // Merge template design with generated content
          return {
            slide_title: contentSlide.slide_title || (templateSlide.role === 'title' ? 'Presentation Title' : `Slide ${index + 1}`),
            bullets: contentSlide.bullets || [],
            design: {
              ...templateSlide.design,
              // Preserve any custom design properties
              layout: templateSlide.design.layout,
              icon: templateSlide.design.icon,
            },
            imageQueryHint: templateSlide.imageQueryHint,
            role: templateSlide.role,
          }
        })
        
        outline.slides = fixedSlides
        console.log(`[Generate] Applied manual design set "${manualSet.name}" with ${fixedSlides.length} fixed slides`)
      } else {
        // Fallback to old preset system if manual set not found
        console.warn(`[Generate] Manual set "${manualSetId}" not found, falling back to preset application`)
        const { applyDesignPreset } = await import('@/lib/ticha/design/presets')
        outline.slides = applyDesignPreset(outline.slides, preset)
        console.log(`[Generate] Applied ${preset} preset to ${outline.slides.length} slides`)
      }
    }

    // Step 6: Create PowerPoint presentation
    console.log(`[Generate] Step 6: Creating PowerPoint...`)
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

    // Step 7: Upload PPT to Storage
    console.log(`[Generate] Step 7: Uploading to Storage...`)
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

    // Step 8: Create database record (optional)
    // Prepare presentation data for storage - Normalize all designs to business template
    const presentationData = {
      id: '', // Will be set by database
      title: prompt ? `Presentation: ${prompt.substring(0, 50)}` : 'TichaAI Presentation',
      author: userId || 'TichaAI User',
      company: 'TichaAI',
      slides: outline.slides.map((slide, index) => {
        const design = slide.design || {}
        
        // Normalize background color to business template
        let bgColor = design.background_color
        if (!bgColor || bgColor === 'light-blue' || bgColor === 'dark-blue' || 
            bgColor?.includes('667eea') || bgColor?.includes('764ba2') || 
            bgColor?.includes('1e3c72')) {
          bgColor = index === 0 ? '#FF8A00' : (index % 2 === 0 ? '#2D3542' : '#FFFFFF')
        }
        
        // Normalize text color
        const textColor = bgColor === '#FFFFFF' ? 'black' : 'white'
        
        // Normalize fonts to business template
        const fontFamily = design.fontFamily || 'Montserrat'
        const fontSize = design.fontSize || (index === 0 ? 48 : 32)
        
        return {
          id: `slide-${index + 1}`,
          slide_number: index + 1,
          slide_title: slide.slide_title,
          bullets: slide.bullets,
          design: {
            ...design,
            background_color: bgColor,
            text_color: textColor,
            fontFamily: fontFamily,
            fontSize: fontSize,
          },
        }
      }),
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
        design_customizations: matchedDesigns.length > 0 ? {
          matchedDesignIds: matchedDesigns.map(d => d.designId),
          matchedDesignCount: matchedDesigns.length,
        } : null,
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
        .maybeSingle()

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
            .maybeSingle()
          
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

