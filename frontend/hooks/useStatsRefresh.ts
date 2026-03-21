'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useStatsRefresh(orgId: string) {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/org/stats')
      const data = await res.json()
      setStats(data)
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()

    if (!orgId) return

    // Re-fetch stats when new coordination events come in
    const channel = supabase
      .channel(`stats-refresh:${orgId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'coordination_events',
        filter: `org_id=eq.${orgId}`,
      }, () => fetchStats())
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, () => fetchStats())
      .subscribe()

    // Also refresh every 60 seconds as a fallback
    const interval = setInterval(fetchStats, 60000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [orgId, fetchStats, supabase])

  return { stats, loading, refetch: fetchStats }
}
