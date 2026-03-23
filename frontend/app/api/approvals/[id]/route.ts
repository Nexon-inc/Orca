import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id: approvalId } = await params
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { status, version: clientVersion } = await request.json()
  const supabase = await createServerSupabaseClient()

  // 1. Optimistic Locking Check (Phase 9)
  const { data: current } = await supabase
    .from('approval_requests')
    .select('version, status')
    .eq('id', approvalId)
    .single()

  if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (current.version !== clientVersion) {
    return NextResponse.json({ 
      error: 'Conflict detected. This request has been modified by another head.',
      currentStatus: current.status 
    }, { status: 409 })
  }

  // 2. Perform Atomic Update
  const { data: updated, error } = await supabase
    .from('approval_requests')
    .update({ 
      status, 
      handled_by_user_id: user.id,
      version: current.version + 1,
      handled_at: new Date().toISOString()
    })
    .eq('id', approvalId)
    .eq('version', clientVersion) // Double safety
    .select()
    .single()

  if (error || !updated) {
    return NextResponse.json({ error: 'Update failed. Possible concurrent modification.' }, { status: 409 })
  }

  return NextResponse.json({ approval: updated })
}
