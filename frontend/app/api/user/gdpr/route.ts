import { createServerSupabaseClient, createServiceSupabaseClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createServerSupabaseClient()

  // Collect all data for this user
  const [profile, orgMember, conversations, teamMessages] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('org_members').select('*, organizations(*)').eq('user_id', user.id).single(),
    supabase.from('conversations').select('*, messages(*)').eq('user_id', user.id),
    supabase.from('team_messages').select('*').or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`),
  ])

  const exportData = {
    exported_at: new Date().toISOString(),
    profile: profile.data,
    organisation: orgMember.data,
    conversations: conversations.data,
    messages: teamMessages.data,
  }

  return new Response(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="orca-data-export-${Date.now()}.json"`,
    }
  })
}

export async function DELETE(request: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { confirmation } = await request.json()
  if (confirmation !== 'DELETE MY ACCOUNT') {
    return NextResponse.json({ error: 'Type DELETE MY ACCOUNT to confirm.' }, { status: 400 })
  }

  const supabase = await createServerSupabaseClient()
  const adminSupabase = createServiceSupabaseClient()

  // 1. Get their org membership
  const { data: member } = await supabase
    .from('org_members')
    .select('org_id, role')
    .eq('user_id', user.id)
    .single()

  // 2. If owner — delete the entire org and all its data (CASCADE handles most of it)
  if (member?.role === 'owner') {
    await supabase.from('organizations').delete().eq('id', member.org_id)
  } else {
    // Just remove them from the org
    await supabase.from('org_members').delete().eq('user_id', user.id)
  }

  // 3. Delete profile
  await supabase.from('profiles').delete().eq('id', user.id)

  // 4. Delete auth user — this invalidates all sessions
  await adminSupabase.auth.admin.deleteUser(user.id)

  return NextResponse.json({ deleted: true })
}
