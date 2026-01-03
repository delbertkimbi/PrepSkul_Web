/**
 * Get user's design sets
 */

import { NextRequest, NextResponse } from 'next/server'
import { getTichaSupabaseAdmin } from '@/lib/ticha/supabase-service'
import { getTichaServerSession } from '@/lib/ticha-supabase-server'

export async function GET(request: NextRequest) {
  try {
    const session = await getTichaServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseAdmin = getTichaSupabaseAdmin()

    // Get all user's designs grouped by design set
    const { data: designs, error } = await supabaseAdmin
      .from('ticha_design_inspiration')
      .select('*')
      .eq('uploaded_by', session.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Group by design set (category contains designSetId)
    const designSets: Record<string, any[]> = {}
    
    designs?.forEach(design => {
      const category = design.category || ''
      if (category.startsWith('user-set:')) {
        const setId = category.replace('user-set:', '')
        if (!designSets[setId]) {
          designSets[setId] = []
        }
        designSets[setId].push(design)
      } else if (category === 'user-uploaded') {
        // Single uploads go into a default set
        const defaultSet = 'default-user-designs'
        if (!designSets[defaultSet]) {
          designSets[defaultSet] = []
        }
        designSets[defaultSet].push(design)
      }
    })

    // Format response
    const sets = Object.entries(designSets).map(([setId, setDesigns]) => {
      const firstDesign = setDesigns[0]
      const setName = firstDesign?.description?.split(' - ')[0] || 'My Design Set'
      
      return {
        id: setId,
        name: setName,
        count: setDesigns.length,
        designs: setDesigns.map(d => ({
          id: d.id,
          imageUrl: d.image_url,
          extractedDesign: d.extracted_design_spec,
        })),
      }
    })

    return NextResponse.json({ sets })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

