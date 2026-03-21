'use client'
import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRealtimeApprovals(
  orgId: string,
  onNewApproval: (approval: any) => void
) {
  const supabase = createClient()
  const callbackRef = useRef(onNewApproval)
  useEffect(() => { callbackRef.current = onNewApproval }, [onNewApproval])

  useEffect(() => {
    if (!orgId) return

    const channel = supabase
      .channel(`approvals:${orgId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'approval_requests',
        filter: `org_id=eq.${orgId}`,
      }, payload => callbackRef.current(payload.new))
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [orgId, supabase])
}
