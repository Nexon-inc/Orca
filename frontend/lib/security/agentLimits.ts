import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function checkAgentRateLimit(agentId: string): Promise<boolean> {
  const supabase = await createServerSupabaseClient()
  const today = new Date().toISOString().split('T')[0]

  const { data } = await supabase
    .from('agent_action_limits')
    .select('action_count, limit_cap')
    .eq('agent_id', agentId)
    .eq('action_date', today)
    .maybeSingle()

  if (!data) return true // No record yet — first action today, allowed
  return data.action_count < data.limit_cap
}

export async function incrementAgentActionCount(agentId: string): Promise<void> {
  const supabase = await createServerSupabaseClient()
  const today = new Date().toISOString().split('T')[0]

  // Upsert — create if first action today, increment if exists
  await supabase.rpc('increment_agent_action_count', {
    p_agent_id: agentId,
    p_date: today,
  })
}
