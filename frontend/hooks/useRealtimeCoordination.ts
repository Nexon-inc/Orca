'use client'
import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRealtimeCoordination(
  orgId: string,
  onNewEvent: (event: any) => void
) {
  const supabase = createClient()
  const callbackRef = useRef(onNewEvent)
  useEffect(() => { callbackRef.current = onNewEvent }, [onNewEvent])

  useEffect(() => {
    if (!orgId) return

    const channel = supabase
      .channel(`coordination:${orgId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'coordination_events',
        filter: `org_id=eq.${orgId}`,
      }, payload => {
        // The payload only contains the new row data
        callbackRef.current(payload.new)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [orgId, supabase])
}
