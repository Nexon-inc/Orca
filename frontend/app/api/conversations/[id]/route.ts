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

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
