import { getAuthUser } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File

  if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })

  const supabase = await createServerSupabaseClient()
  const { data: member } = await supabase
    .from('org_members')
    .select('org_id, role')
    .eq('user_id', user.id)
    .single()

  if (!member || !['owner', 'cofounder'].includes(member.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const fileExt = file.name.split('.').pop()
  const fileName = `${member.org_id}-${Date.now()}.${fileExt}`
  const filePath = `logos/${fileName}`

  // Ensure storage bucket "public" or "assets" exists
  const { error: uploadError } = await supabase.storage
    .from('company_assets')
    .upload(filePath, file)

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 400 })

  const { data: publicUrlData } = supabase.storage
    .from('company_assets')
    .getPublicUrl(filePath)

  await supabase
    .from('company_identity')
    .update({ logo_url: publicUrlData.publicUrl })
    .eq('org_id', member.org_id)

  return NextResponse.json({ url: publicUrlData.publicUrl })
}
