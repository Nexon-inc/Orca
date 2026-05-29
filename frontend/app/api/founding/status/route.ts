import { NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createServiceSupabaseClient()
    const { data: config } = await supabase
      .from('founding_config')
      .select('total_spots, spots_taken')
      .limit(1)
      .maybeSingle()

    const total = config?.total_spots ?? 50
    const taken = config?.spots_taken ?? 0
    const remaining = Math.max(0, total - taken)

    return NextResponse.json({
      total,
      taken,
      remaining,
      available: remaining > 0,
      locked_price: 19,
    })
  } catch {
    return NextResponse.json({ total: 50, taken: 0, remaining: 50, available: true, locked_price: 19 })
  }
}
