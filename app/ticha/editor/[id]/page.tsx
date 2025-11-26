/**
 * TichaAI Editor Page
 * PowerPoint-like editor for presentations
 */

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useEditorStore } from '@/lib/ticha/editor/state'
import { SlideCanvas } from '@/components/ticha/editor/SlideCanvas'
import { PropertiesPanel } from '@/components/ticha/editor/PropertiesPanel'
import { EditorToolbar } from '@/components/ticha/editor/EditorToolbar'
import { SlideThumbnails } from '@/components/ticha/editor/SlideThumbnails'
import { Loader2 } from 'lucide-react'
import { tichaSupabase } from '@/lib/ticha-supabase'
import type { PresentationData } from '@/lib/ticha/types'

export default function EditorPage() {
  const params = useParams()
  const router = useRouter()
  const presentationId = params.id as string

  const { setPresentation, presentation } = useEditorStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadPresentation() {
      if (!presentationId) {
        setError('No presentation ID provided')
        setLoading(false)
        return
      }

      try {
        // Get current user
        const { data: { user } } = await tichaSupabase.auth.getUser()

        // Fetch presentation from database
        const { data, error: fetchError } = await tichaSupabase
          .from('ticha_presentations')
          .select('*')
          .eq('id', presentationId)
          .single()

        if (fetchError || !data) {
          throw new Error('Presentation not found')
        }

        // Verify ownership
        if (user && data.user_id !== user.id) {
          throw new Error('Unauthorized')
        }

        // Load presentation data
        const presentationData: PresentationData | null = data.presentation_data

        if (!presentationData) {
          throw new Error('Presentation data not found')
        }

        // Set in store
        setPresentation(presentationData)
        setLoading(false)
      } catch (err) {
        console.error('Failed to load presentation:', err)
        setError(err instanceof Error ? err.message : 'Failed to load presentation')
        setLoading(false)
      }
    }

    loadPresentation()
  }, [presentationId, setPresentation])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading presentation...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/tichar')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (!presentation) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">No presentation data</p>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Toolbar */}
      <EditorToolbar />

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Slide Thumbnails */}
        <SlideThumbnails />

        {/* Center - Slide Canvas */}
        <SlideCanvas />

        {/* Right Sidebar - Properties Panel */}
        <PropertiesPanel />
      </div>
    </div>
  )
}

