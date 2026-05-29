import { createServiceSupabaseClient } from '@/lib/supabase/server'

export const FOUNDING_LOCKED_USD = 19

export async function getFoundingAvailability() {
  const supabase = createServiceSupabaseClient()
  const { data: config } = await supabase
    .from('founding_config')
    .select('total_spots, spots_taken')
    .limit(1)
    .maybeSingle()

  const total = config?.total_spots ?? 50
  const taken = config?.spots_taken ?? 0
  const remaining = Math.max(0, total - taken)

  return { total, taken, remaining, available: remaining > 0 }
}

export async function isOrgFoundingMember(orgId: string): Promise<boolean> {
  const supabase = createServiceSupabaseClient()
  const { data } = await supabase
    .from('founding_members')
    .select('id')
    .eq('org_id', orgId)
    .maybeSingle()
  return !!data
}

/** Idempotent — skips if org already has a founding row */
export async function recordFoundingMember(orgId: string, userId: string): Promise<boolean> {
  const supabase = createServiceSupabaseClient()

  const { data: existing } = await supabase
    .from('founding_members')
    .select('id')
    .eq('org_id', orgId)
    .maybeSingle()

  if (existing) return false

  const { data: config } = await supabase
    .from('founding_config')
    .select('id, spots_taken, total_spots')
    .limit(1)
    .maybeSingle()

  if (!config) return false

  const spotNumber = (config.spots_taken ?? 0) + 1
  if (spotNumber > (config.total_spots ?? 50)) return false

  const { error: insertErr } = await supabase.from('founding_members').insert({
    user_id: userId,
    org_id: orgId,
    spot_number: spotNumber,
    locked_price: FOUNDING_LOCKED_USD,
  })

  if (insertErr) return false

  await supabase
    .from('founding_config')
    .update({ spots_taken: spotNumber, updated_at: new Date().toISOString() })
    .eq('id', config.id)

  return true
}
