import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Extract form data
    const applicationData = {
      full_name: formData.get("full_name") as string,
      age_range: formData.get("age_range") as string,
      gender: formData.get("gender") as string,
      city: formData.get("city") as string,
      region: formData.get("region") as string,
      status: formData.get("status") as string,
      status_other: formData.get("status_other") as string | null,
      student_class_level: formData.get("student_class_level") as string | null,
      motivation: formData.get("motivation") as string,
      alignment_goals: JSON.parse(formData.get("alignment_goals") as string || "[]"),
      explanation: formData.get("explanation") as string | null,
      social_platforms: formData.get("social_platforms") ? JSON.parse(formData.get("social_platforms") as string) : null,
      social_media_influence_rating: formData.get("social_media_influence_rating") ? parseInt(formData.get("social_media_influence_rating") as string) : null,
      promotion_methods: JSON.parse(formData.get("promotion_methods") as string || "[]"),
      promotion_methods_other: formData.get("promotion_methods_other") as string | null,
      creative_idea: formData.get("creative_idea") as string | null,
      email: formData.get("email") as string,
      whatsapp_number: formData.get("whatsapp_number") as string,
    }

    // Validate required fields
    if (!applicationData.full_name || !applicationData.email || !applicationData.motivation) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Use admin client to bypass RLS for public form submissions
    const supabase = getSupabaseAdmin()

    // Handle profile image upload if provided
    let profileImageUrl: string | null = null
    const profileImage = formData.get("profile_image") as File | null

    if (profileImage && profileImage.size > 0) {
      try {
        // Validate file type
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png"]
        if (!allowedTypes.includes(profileImage.type)) {
          return NextResponse.json(
            { error: "Profile image must be JPG or PNG" },
            { status: 400 }
          )
        }

        // Validate file size (5MB max)
        if (profileImage.size > 5 * 1024 * 1024) {
          return NextResponse.json(
            { error: "Profile image must be less than 5MB. Please compress your image and try again." },
            { status: 400 }
          )
        }

        // Upload to Supabase Storage using main Supabase client
        const fileBuffer = Buffer.from(await profileImage.arrayBuffer())
        const timestamp = Date.now()
        const fileName = `${timestamp}-${profileImage.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        const storagePath = `ambassador_profiles/${fileName}`

        // Convert to Blob for Supabase
        const blob = new Blob([fileBuffer], { type: profileImage.type })

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("ambassador_profiles")
          .upload(storagePath, blob, {
            contentType: profileImage.type,
            upsert: false,
          })

        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`)
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from("ambassador_profiles")
          .getPublicUrl(storagePath)

        profileImageUrl = publicUrl
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error"
        return NextResponse.json(
          { error: `Failed to upload profile image: ${errorMessage}. Please try again or use a smaller image.` },
          { status: 500 }
        )
      }
    }

    // Insert application into database
    const { data, error } = await supabase
      .from("ambassadors")
      .insert({
        ...applicationData,
        profile_image_url: profileImageUrl,
      })
      .select()
      .single()

    if (error) {
      // Provide user-friendly error messages based on error type
      let errorMessage = "Failed to submit application"
      
      if (error.code === '23505') { // Unique constraint violation
        errorMessage = "An application with this email already exists. Please use a different email or contact support if you believe this is an error."
      } else if (error.code === '23503') { // Foreign key violation
        errorMessage = "There was an issue with the form data. Please refresh the page and try again."
      } else if (error.code === '23502') { // Not null violation
        errorMessage = "Please fill in all required fields before submitting."
      } else if (error.message?.includes('column') || error.message?.includes('does not exist')) {
        errorMessage = "There was a database configuration issue. Our team has been notified. Please try again in a few minutes."
      } else {
        errorMessage = `Unable to save your application: ${error.message || 'Unknown error'}. Please try again or contact support.`
      }
      
      return NextResponse.json(
        { error: errorMessage, details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      id: data.id,
      message: "Application submitted successfully",
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { 
        error: "We encountered an unexpected error while processing your application. Please try again in a few moments. If the problem persists, contact our support team.",
        details: errorMessage 
      },
      { status: 500 }
    )
  }
}

