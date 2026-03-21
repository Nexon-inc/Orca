import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  const body = await request.json()
  
  // HubSpot sends an array of deletion events
  const events = Array.isArray(body) ? body : [body]
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  for (const event of events) {
    if (event.subscriptionType === 'contact.privacyDeletion') {
      // Log the deletion request to audit log
      await supabase.from('audit_log').insert({
        org_id: null,
        actor_type: 'system',
        action: 'hubspot_privacy_deletion_received',
        metadata: { 
          hubspot_object_id: event.objectId,
          event_type: event.subscriptionType 
        }
      })
    }
  }

  return NextResponse.json({ received: true })
}
