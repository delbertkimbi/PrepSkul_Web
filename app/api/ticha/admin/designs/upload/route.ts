/**
 * Upload Design Image and Extract Design Patterns
 * POST /api/ticha/admin/designs/upload
 */

import { NextRequest, NextResponse } from 'next/server'
import { extractDesignFromImage } from '@/lib/ticha/design/extractor'
import { uploadFileToStorage, getTichaSupabaseAdmin } from '@/lib/ticha/supabase-service'
import { getTichaServerSession } from '@/lib/ticha-supabase-server'
import { isTichaAdmin } from '@/lib/ticha/admin'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB for images
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin status
    const user = await getTichaServerSession()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminStatus = await isTichaAdmin(user.id)
    if (!adminStatus) {
      return NextResponse.json({ error: 'Admin privileges required' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const keywordsStr = formData.get('keywords') as string
    const category = formData.get('category') as string
    const description = formData.get('description') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    // Parse keywords
    const keywords = keywordsStr
      ? keywordsStr
          .split(',')
          .map((k) => k.trim())
          .filter((k) => k.length > 0)
      : []

    // Step 1: Upload image to Supabase Storage
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const storagePath = `design-inspiration/${fileName}`

    console.log(`[DesignUpload] Uploading image to storage: ${storagePath}`)
    const { url: imageUrl } = await uploadFileToStorage(
      'design-inspiration',
      storagePath,
      fileBuffer,
      file.type
    )

    console.log(`[DesignUpload] Image uploaded: ${imageUrl}`)

    // Step 2: Extract design patterns using AI vision
    console.log(`[DesignUpload] Extracting design patterns from: ${imageUrl}`)
    console.log(`[DesignUpload] Keywords provided:`, keywords)
    let extractedDesign
    try {
      extractedDesign = await extractDesignFromImage(imageUrl, keywords)
      console.log(`[DesignUpload] Design extracted successfully!`)
      console.log(`[DesignUpload] Extracted colors:`, extractedDesign?.colorPalette)
      console.log(`[DesignUpload] Extracted fonts:`, extractedDesign?.typography?.fonts)
      console.log(`[DesignUpload] Extracted layout:`, extractedDesign?.layoutPattern)
      console.log(`[DesignUpload] Quality score:`, extractedDesign?.qualityScore)
      
      if (!extractedDesign) {
        console.warn(`[DesignUpload] WARNING: extractDesignFromImage returned null/undefined`)
      }
    } catch (error) {
      console.error(`[DesignUpload] Design extraction failed:`, error)
      console.error(`[DesignUpload] Error details:`, error instanceof Error ? error.stack : String(error))
      // Continue anyway - we'll store the image and can re-extract later
      extractedDesign = null
    }

    // Step 3: Store in database
    const supabase = getTichaSupabaseAdmin()
    const { data: designRecord, error: dbError } = await supabase
      .from('ticha_design_inspiration')
      .insert({
        source_url: imageUrl,
        image_url: imageUrl,
        keywords: keywords.length > 0 ? keywords : null,
        category: category || null,
        design_data: extractedDesign
          ? {
              colorPalette: extractedDesign.colorPalette,
              layoutPatterns: [extractedDesign.layoutPattern],
              typography: extractedDesign.typography,
              styleKeywords: extractedDesign.styleKeywords,
            }
          : {},
        extracted_design_spec: extractedDesign || null,
        quality_score: extractedDesign?.qualityScore || null,
        usage_count: 0,
        uploaded_by: user.id,
      })
      .select()
      .single()

    if (dbError) {
      console.error(`[DesignUpload] Database error:`, dbError)
      return NextResponse.json(
        { error: `Failed to save design: ${dbError.message}` },
        { status: 500 }
      )
    }

    console.log(`[DesignUpload] Stored design with ID: ${designRecord.id}`)
    console.log(`[DesignUpload] Has extracted spec: ${!!designRecord.extracted_design_spec}`)
    console.log(`[DesignUpload] Keywords stored:`, designRecord.keywords)
    
    return NextResponse.json({
      success: true,
      design: {
        id: designRecord.id,
        imageUrl: designRecord.image_url,
        keywords: designRecord.keywords,
        category: designRecord.category,
        qualityScore: designRecord.quality_score,
        extractedDesign: designRecord.extracted_design_spec,
      },
    })
  } catch (error) {
    console.error(`[DesignUpload] Error:`, error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to upload design: ${errorMessage}` },
      { status: 500 }
    )
  }
}

