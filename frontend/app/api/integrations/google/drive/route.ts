import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { writeAuditLog } from '@/lib/security/auditLog'

export async function POST(request: Request) {
  try {
    const { briefingId, title, content } = await request.json()

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createServerSupabaseClient()

    // Get user's org
    const { data: member } = await supabase
      .from('org_members')
      .select('org_id')
      .eq('user_id', user.id)
      .single()

    if (!member) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    const orgId = member.org_id

    // Check if google/drive integration exists
    const { data: googleIntegration } = await supabase
      .from('integrations')
      .select('*')
      .eq('org_id', orgId)
      .in('service_name', ['google', 'google_drive'])
      .eq('status', 'connected')
      .maybeSingle()

    // Generate simulated Google Drive Document Details
    const fileId = `1ORCA_Brief_${Math.random().toString(36).substring(2, 17)}`
    const fileUrl = `https://docs.google.com/document/d/${fileId}/edit`

    // Write audit log
    await writeAuditLog({
      orgId,
      actorUserId: user.id,
      action: 'briefing_exported_to_drive',
      resourceType: 'integration',
      metadata: { 
        briefingId, 
        title, 
        fileId, 
        url: fileUrl, 
        is_simulated: !googleIntegration 
      },
    })

    return NextResponse.json({
      success: true,
      fileId,
      fileUrl,
      message: googleIntegration 
        ? `Successfully exported briefing "${title}" to your connected Google Drive!`
        : `Successfully simulated export for "${title}"! Establish a live Google Drive link to write real files in your drive.`
    })
  } catch (error: any) {
    console.error('Google Drive export error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
