import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth'
import { getIntegrationConfig } from '@/lib/integrations/registry'
import { encryptToken } from '@/lib/security/encrypt'
import { writeAuditLog } from '@/lib/security/auditLog'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { service_key, api_key } = await request.json()
    
    if (!service_key || !api_key) {
      return NextResponse.json({ error: 'Service key and API key are required' }, { status: 400 })
    }

    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createServerSupabaseClient()
    const config = getIntegrationConfig(service_key)
    
    if (!config || config.auth_method !== 'apikey') {
      return NextResponse.json({ error: 'Invalid service for API key authentication' }, { status: 400 })
    }

    const { data: member } = await supabase
      .from('org_members')
      .select('org_id')
      .eq('user_id', user.id)
      .single()

    if (!member) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    const orgId = member.org_id

    const { error: upsertError } = await supabase
      .from('integrations')
      .upsert({
        org_id: orgId,
        service_name: service_key,
        department_key: config.department_key,
        status: 'connected',
        access_token_encrypted: encryptToken(api_key),
        metadata: { auth_type: 'apikey' },
        connected_at: new Date().toISOString(),
      }, { onConflict: 'org_id,service_name' })

    if (upsertError) {
      console.error('Error storing API key:', upsertError)
      return NextResponse.json({ error: 'Failed to store API key' }, { status: 500 })
    }

    await writeAuditLog({
      orgId,
      actorUserId: user.id,
      action: 'integration_connected',
      resourceType: 'integration',
      metadata: { service: service_key, dept: config.department_key, auth_type: 'apikey' },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API Key integration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
