/**
 * Design Management API
 * GET: List all designs with pagination, search, filter
 * DELETE: Remove design from database
 */

import { NextRequest, NextResponse } from 'next/server'
import { getTichaSupabaseAdmin } from '@/lib/ticha/supabase-service'
import { getTichaServerSession } from '@/lib/ticha-supabase-server'
import { isTichaAdmin } from '@/lib/ticha/admin'

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'quality_score' // quality_score, usage_count, created_at
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const supabase = getTichaSupabaseAdmin()

    // Build query
    let query = supabase
      .from('ticha_design_inspiration')
      .select('*', { count: 'exact' })

    // Apply filters
    if (category) {
      query = query.eq('category', category)
    }

    if (search) {
      // Search in keywords array
      query = query.or(`keywords.cs.{${search}}`)
    }

    // Apply sorting
    const ascending = sortOrder === 'asc'
    if (sortBy === 'usage_count') {
      query = query.order('usage_count', { ascending, nullsLast: true })
    } else if (sortBy === 'created_at') {
      query = query.order('created_at', { ascending })
    } else {
      // Default: quality_score
      query = query.order('quality_score', { ascending, nullsLast: true })
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: designs, error, count } = await query

    if (error) {
      console.error(`[DesignList] Error:`, error)
      return NextResponse.json(
        { error: `Failed to fetch designs: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      designs: designs || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error(`[DesignList] Error:`, error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to list designs: ${errorMessage}` },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const designId = searchParams.get('id')

    if (!designId) {
      return NextResponse.json(
        { error: 'Design ID is required' },
        { status: 400 }
      )
    }

    const supabase = getTichaSupabaseAdmin()

    // Get design to delete image from storage
    const { data: design, error: fetchError } = await supabase
      .from('ticha_design_inspiration')
      .select('image_url')
      .eq('id', designId)
      .single()

    if (fetchError || !design) {
      return NextResponse.json(
        { error: 'Design not found' },
        { status: 404 }
      )
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('ticha_design_inspiration')
      .delete()
      .eq('id', designId)

    if (deleteError) {
      console.error(`[DesignDelete] Error:`, deleteError)
      return NextResponse.json(
        { error: `Failed to delete design: ${deleteError.message}` },
        { status: 500 }
      )
    }

    // Optionally delete image from storage (you may want to keep it for backup)
    // if (design.image_url) {
    //   const path = design.image_url.split('/').slice(-2).join('/')
    //   await supabase.storage.from('design-inspiration').remove([path])
    // }

    return NextResponse.json({
      success: true,
      message: 'Design deleted successfully',
    })
  } catch (error) {
    console.error(`[DesignDelete] Error:`, error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to delete design: ${errorMessage}` },
      { status: 500 }
    )
  }
}

