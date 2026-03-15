'use server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth'
import { getIntegrationConfig } from '@/lib/integrations/registry'
import { encryptToken } from '@/lib/security/encrypt'
import { writeAuditLog } from '@/lib/security/auditLog'
import { getIntegrationConfig as _cfg } from '@/lib/integrations/registry'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { service_key, api_key, subdomain } = await request.json()

  const config = getIntegrationConfig(service_key)
  if (!config || config.auth_method !== 'apikey') {
    return NextResponse.json({ error: 'Integration not found or not API key based' }, { status: 404 })
  }

  const testUrl = config.apikey_test_url!.replace('{subdomain}', subdomain || 'app')
  const testHeader = config.apikey_test_header || 'Authorization'
  const testPrefix = config.apikey_test_prefix || ''

  try {
    const testResponse = await fetch(testUrl, {
      headers: { [testHeader]: `${testPrefix}${api_key}`, 'Content-Type': 'application/json' },
    })
    if (!testResponse.ok) {
      return NextResponse.json({ error: 'Invalid API key — could not authenticate with the service.' }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'Could not reach the service to validate your API key.' }, { status: 400 })
  }

  const supabase = await createServerSupabaseClient()
  const { data: member } = await supabase.from('org_members').select('org_id').eq('user_id', user.id).single()
  const orgId = member!.org_id

  await supabase.from('integrations').upsert({
    org_id: orgId,
    service_name: service_key,
    department_key: config.department_key,
    status: 'connected',
    access_token_encrypted: encryptToken(api_key),
    metadata: { subdomain: subdomain || null, validated_at: new Date().toISOString() },
    connected_at: new Date().toISOString(),
  }, { onConflict: 'org_id,service_name' })

  await writeAuditLog({
    orgId,
    actorUserId: user.id,
    action: 'integration_connected',
    resourceType: 'integration',
    metadata: { service: service_key, dept: config.department_key, method: 'apikey' },
  })

  return NextResponse.json({ connected: true, service: service_key })
}
