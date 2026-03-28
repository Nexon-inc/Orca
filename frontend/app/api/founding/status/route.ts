import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createServerSupabaseClient()

  // Change 9: Get founding member config
  const { data } = await supabase
    .from('founding_config')
    .select('total_spots, spots_taken')
    .single()

  if (!data) {
    return NextResponse.json({
      total: 50,
      taken: 0,
      remaining: 50,
      available: true,
    })
  }

  return NextResponse.json({
    total: data.total_spots,
    taken: data.spots_taken,
    remaining: data.total_spots - data.spots_taken,
    available: data.spots_taken < data.total_spots,
  })
}
