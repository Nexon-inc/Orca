'use client'
import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRealtimeActivity(
  orgId: string,
  onNewMessage: (message: any) => void
) {
  const supabase = createClient()
  const callbackRef = useRef(onNewMessage)
  useEffect(() => { callbackRef.current = onNewMessage }, [onNewMessage])

  useEffect(() => {
    if (!orgId) return

    const channel = supabase
      .channel(`activity:${orgId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `sender_type=eq.agent`,
      }, payload => callbackRef.current(payload.new))
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [orgId, supabase])
}
