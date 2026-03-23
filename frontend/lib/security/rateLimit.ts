import { createServerSupabaseClient } from '@/lib/supabase/server'

// Limits per bucket key:
const LIMITS: Record<string, { max: number; windowSeconds: number }> = {
  api_calls:      { max: 200,  windowSeconds: 60   }, // 200 per minute
  agent_briefs:   { max: 30,   windowSeconds: 60   }, // 30 briefs per minute
  invites:        { max: 10,   windowSeconds: 3600 }, // 10 invites per hour
  billing:        { max: 5,    windowSeconds: 3600 }, // 5 checkout attempts per hour
  auth_attempts:  { max: 10,   windowSeconds: 900  }, // 10 login attempts per 15min
}

export async function checkRateLimit(
  userId: string,
  bucket: keyof typeof LIMITS
): Promise<{ allowed: boolean; remaining: number }> {
  const supabase = await createServerSupabaseClient()
  const { max, windowSeconds } = LIMITS[bucket]
  const now = new Date()
  const windowStart = new Date(now.getTime() - windowSeconds * 1000)

  const { data } = await supabase
    .from('rate_limit_buckets')
    .select('count, window_start')
    .eq('user_id', userId)
    .eq('bucket_key', bucket)
    .maybeSingle()

  // If no record or window expired — reset and allow
  if (!data || new Date(data.window_start) < windowStart) {
    await supabase.from('rate_limit_buckets').upsert({
      user_id: userId,
      bucket_key: bucket,
      count: 1,
      window_start: now.toISOString(),
    })
    return { allowed: true, remaining: max - 1 }
  }

  // Within window — check count
  if (data.count >= max) {
    return { allowed: false, remaining: 0 }
  }

  // Increment count
  await supabase
    .from('rate_limit_buckets')
    .update({ count: data.count + 1 })
    .eq('user_id', userId)
    .eq('bucket_key', bucket)

  return { allowed: true, remaining: max - data.count - 1 }
}
