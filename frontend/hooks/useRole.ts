'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export function useRole() {
  const [plan, setPlan] = useState<string>('free')
  const [role, setRole] = useState<string>('member')
  const [orgId, setOrgId] = useState<string | null>(null)
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null)
  const [orgCreatedAt, setOrgCreatedAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function fetchRole() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data: member } = await supabase
        .from('org_members')
        .select('role, org_id, organizations(plan, plan_expires_at, created_at)')
        .eq('user_id', user.id)
        .single()

      if (member) {
        setRole(member.role)
        setOrgId(member.org_id)
        const org: any = member.organizations
        setPlan(org?.plan || 'free')
        setTrialEndsAt(org?.plan_expires_at || null)
        setOrgCreatedAt(org?.created_at || null)
      }
      setLoading(false)
    }

    fetchRole()
  }, [])

  return { plan, role, orgId, trialEndsAt, orgCreatedAt, loading }
}
