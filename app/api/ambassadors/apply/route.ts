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
      motivation: formData.get("motivation") as string,
      alignment_goals: JSON.parse(formData.get("alignment_goals") as string || "[]"),
      explanation: formData.get("explanation") as string | null,
      social_platforms: formData.get("social_platforms") ? JSON.parse(formData.get("social_platforms") as string) : null,
      reach_range: formData.get("reach_range") as string | null,
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

        // Validate file size (2MB max)
        if (profileImage.size > 2 * 1024 * 1024) {
          return NextResponse.json(
            { error: "Profile image must be less than 2MB" },
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
        console.error("[Ambassadors] Image upload error:", error)
        return NextResponse.json(
          { error: "Failed to upload profile image" },
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
      console.error("[Ambassadors] Database error:", error)
      return NextResponse.json(
        { error: "Failed to submit application", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      id: data.id,
      message: "Application submitted successfully",
    })
  } catch (error) {
    console.error("[Ambassadors] Error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

