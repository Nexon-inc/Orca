'use server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth'
import { emailTemplates, resend } from '@/lib/email/resend'
import { NextResponse } from 'next/server'

export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createServerSupabaseClient()

  const { data: self } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .single()

  if (!self) return NextResponse.json({ error: 'Not a member' }, { status: 403 })

  const { data: members } = await supabase
    .from('org_members')
    .select(`
      id, role, department_key, joined_at,
      profiles (id, full_name, email, avatar_initials, job_title)
    `)
    .eq('org_id', self.org_id)

  return NextResponse.json({ members })
}

export async function POST(request: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { email, role, department_key } = await request.json()
  const supabase = await createServerSupabaseClient()

  const { data: self } = await supabase
    .from('org_members')
    .select('org_id, role, profiles(full_name), organizations(name)')
    .eq('user_id', user.id)
    .single()

  if (!self || !['owner', 'cofounder', 'head'].includes(self.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (self.role === 'head' && !['member', 'advisor'].includes(role)) {
    return NextResponse.json({ error: 'Heads can only invite members or advisors.' }, { status: 403 })
  }

  const { data: invite } = await supabase
    .from('invite_tokens')
    .insert({
      org_id: (self as any).org_id,
      invited_by: user.id,
      email,
      role,
      department_key: department_key ?? null,
    })
    .select('token')
    .single()

  if (!invite) return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 })

  const orgName = (self as any).organizations?.name ?? 'your organization'
  const inviterName = (self as any).profiles?.full_name ?? 'Your team'
  const template = emailTemplates.invite(inviterName, orgName, role, invite.token)

  await resend.emails.send({
    from: 'ORCA <noreply@nexonic.com>',
    to: email,
    subject: template.subject,
    html: template.html,
  })

  return NextResponse.json({ success: true, token: invite.token })
}
