/**
 * Check if current user is a Ticha admin
 * GET /api/ticha/admin/check
 */

import { NextRequest, NextResponse } from 'next/server'
import { getTichaServerSession } from '@/lib/ticha-supabase-server'
import { isTichaAdmin } from '@/lib/ticha/admin'

export async function GET(request: NextRequest) {
  try {
    const session = await getTichaServerSession()
    
    if (!session) {
      return NextResponse.json({ isAdmin: false, authenticated: false }, { status: 401 })
    }

    const adminStatus = await isTichaAdmin(session.id)

    return NextResponse.json({
      isAdmin: adminStatus,
      authenticated: true,
      userId: session.id,
    })
  } catch (error) {
    console.error('[AdminCheck] Error:', error)
    return NextResponse.json(
      { isAdmin: false, authenticated: false, error: 'Failed to check admin status' },
      { status: 500 }
    )
  }
}

