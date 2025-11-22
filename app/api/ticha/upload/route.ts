/**
 * TichaAI File Upload API
 * Uploads files to Supabase Storage
 */

import { NextRequest, NextResponse } from "next/server"
import { uploadFileToStorage } from "@/lib/ticha/supabase-service"
import { getTichaServerSession } from "@/lib/ticha-supabase-server"

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

/**
 * POST /api/ticha/upload
 * Upload file to Supabase Storage
 */
export async function POST(request: NextRequest) {
  try {
    console.log(`[Upload] Starting file upload request`)

    // Check authentication (optional but recommended)
    let user = null
    try {
      user = await getTichaServerSession()
    } catch (authError) {
      console.warn(`[Upload] Auth check failed (continuing without auth):`, authError)
      // Continue without auth - allow public uploads
    }

    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const prompt = formData.get("prompt") as string | null

    console.log(`[Upload] Received file: ${file?.name || "none"}, size: ${file?.size || 0}, type: ${file?.type || "none"}`)

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` },
        { status: 400 }
      )
    }

    // Validate file type (be more lenient - check extension if MIME type is missing)
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
      "image/gif",
      "text/plain",
    ]

    const fileExtension = file.name.split(".").pop()?.toLowerCase() || ""
    const allowedExtensions = ["pdf", "docx", "jpg", "jpeg", "png", "gif", "txt"]
    
    // Check both MIME type and extension
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      console.error(`[Upload] Invalid file type: ${file.type}, extension: ${fileExtension}`)
      return NextResponse.json(
        { 
          error: "File type not supported. Supported types: PDF, DOCX, Images (JPG/PNG/GIF), TXT",
          details: `Received type: ${file.type || "unknown"}, extension: ${fileExtension || "none"}`
        },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Generate unique file path
    // fileExtension already declared above (line 61)
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    const fileName = `${timestamp}-${randomString}.${fileExtension || "bin"}`
    
    // Upload to Supabase Storage
    const userId = user?.id || "public"
    const filePath = `${userId}/${fileName}`

    console.log(`[Upload] Uploading file: ${filePath} (${file.size} bytes)`)

    const { path, url } = await uploadFileToStorage(
      "uploads",
      filePath,
      buffer,
      file.type
    )

    console.log(`[Upload] File uploaded: ${url}`)

    // Return file URL for generating presentation
    return NextResponse.json({
      success: true,
      fileUrl: url,
      filePath: path,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    })

  } catch (error) {
    console.error(`[Upload] Error:`, error)
    console.error(`[Upload] Error stack:`, error instanceof Error ? error.stack : "No stack trace")
    
    // Check for specific error types
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    
    // Check if it's a credential error
    if (errorMessage.includes("Missing TichaAI Supabase credentials")) {
      return NextResponse.json(
        {
          error: "Server configuration error",
          message: "Missing Supabase credentials. Please check environment variables: NEXT_PUBLIC_TICHA_SUPABASE_URL and TICHA_SUPABASE_SERVICE_KEY",
        },
        { status: 500 }
      )
    }

    // Check if it's a storage bucket error
    if (errorMessage.includes("Failed to upload file") || errorMessage.includes("bucket")) {
      return NextResponse.json(
        {
          error: "Storage error",
          message: errorMessage + ". Please ensure the 'uploads' bucket exists in Supabase Storage.",
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        error: "Failed to upload file",
        message: errorMessage,
      },
      { status: 500 }
    )
  }
}

