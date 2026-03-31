'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export function useRole() {
  const [plan, setPlan] = useState<string>('free')
  const [role, setRole] = useState<string>('member')
  const [orgId, setOrgId] = useState<string | null>(null)
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null)
  const [orgCreatedAt, setOrgCreatedAt] = useState<string | null>(null)
  const [autonomousMode, setAutonomousMode] = useState<boolean>(false)
  const [loading, setLoading] = useState(true)

// Updated hook to include user and profile data
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const supabase = createClient()

    async function fetchRole() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        setLoading(false)
        return
      }
      setUser(authUser)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()
      
      setProfile(profileData)

      const { data: member } = await supabase
        .from('org_members')
        .select('role, org_id, organizations(plan, plan_expires_at, created_at, autonomous_mode)')
        .eq('user_id', authUser.id)
        .single()

      if (member) {
        setRole(member.role)
        setOrgId(member.org_id)
        const org: any = member.organizations
        setPlan(org?.plan || 'free')
        setTrialEndsAt(org?.plan_expires_at || null)
        setOrgCreatedAt(org?.created_at || null)
        setAutonomousMode(org?.autonomous_mode || false)
      }
      setLoading(false)
    }

    fetchRole()
  }, [])

  return { plan, role, orgId, trialEndsAt, orgCreatedAt, autonomousMode, loading, user, profile }
}
