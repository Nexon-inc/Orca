export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { createServiceSupabaseClient } from '@/lib/supabase/server'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id: conversationId } = await params
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { title } = body

  if (!title) return NextResponse.json({ error: 'Missing title' }, { status: 400 })

  const serviceClient = createServiceSupabaseClient()
  const { error } = await serviceClient
    .from('conversations')
    .update({ title: String(title).slice(0, 80) })
    .eq('id', conversationId)
    .eq('user_id', user.id)

  if (error) {
    console.warn('[ORCA_TITLING_WARN] Could not update title. Please ensure the "title" column exists on the "conversations" table.', error.message)
    // Return 200 anyway so the frontend doesn't throw a red 500 error for a background task
    return NextResponse.json({ success: false, error: error.message }, { status: 200 })
  }
  
  return NextResponse.json({ success: true })
}
