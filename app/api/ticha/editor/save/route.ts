/**
 * Editor Save API
 * Saves edited presentation data to database
 */

import { NextRequest, NextResponse } from 'next/server'
import { tichaSupabaseAdmin } from '@/lib/ticha/supabase-service'
import { getTichaServerSession } from '@/lib/ticha-supabase-server'
import type { PresentationData, RefinementHistory } from '@/lib/ticha/types'

interface SaveRequest {
  presentationId: string
  presentationData: PresentationData
  changes?: {
    description: string
    type: 'content' | 'design' | 'structure'
  }
}

/**
 * POST /api/ticha/editor/save
 * Save edited presentation
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request
    const body: SaveRequest = await request.json()
    const { presentationId, presentationData, changes } = body

    if (!presentationId || !presentationData) {
      return NextResponse.json(
        { error: 'presentationId and presentationData are required' },
        { status: 400 }
      )
    }

    // Get user session
    let userId: string | null = null
    try {
      const session = await getTichaServerSession()
      userId = session?.id || null
    } catch (error) {
      console.warn('[EditorSave] Auth check failed, continuing without auth')
    }

    // Verify presentation exists and user has access
    const { data: existing, error: fetchError } = await tichaSupabaseAdmin
      .from('ticha_presentations')
      .select('user_id, refinement_history')
      .eq('id', presentationId)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Presentation not found' },
        { status: 404 }
      )
    }

    // Verify ownership (if user is authenticated)
    if (userId && existing.user_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Update presentation data
    const updateData: any = {
      presentation_data: presentationData,
      updated_at: new Date().toISOString(),
    }

    // If changes are provided, add to refinement history
    if (changes) {
      const existingHistory: RefinementHistory[] = existing.refinement_history || []
      const newHistoryEntry: RefinementHistory = {
        version: (presentationData.metadata?.version || 1) + 1,
        timestamp: new Date().toISOString(),
        prompt: `Manual edit: ${changes.description}`,
        changes: {
          contentChanges: changes.type === 'content' ? [changes.description] : undefined,
          designChanges: changes.type === 'design' ? [changes.description] : undefined,
        },
      }

      updateData.refinement_history = [...existingHistory, newHistoryEntry]
    }

    // Update presentation
    const { error: updateError } = await tichaSupabaseAdmin
      .from('ticha_presentations')
      .update(updateData)
      .eq('id', presentationId)

    if (updateError) {
      console.error('[EditorSave] Failed to update presentation:', updateError)
      return NextResponse.json(
        { error: `Failed to save presentation: ${updateError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Presentation saved successfully',
      savedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[EditorSave] Unexpected error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

