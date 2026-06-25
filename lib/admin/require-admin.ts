import { NextResponse } from 'next/server'
import { getServerSession, isAdmin } from '@/lib/supabase-server'

export async function requireAdminApi() {
  const user = await getServerSession()
  if (!user) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }
  const admin = await isAdmin(user.id)
  if (!admin) {
    return {
      error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    }
  }
  return { user }
}
