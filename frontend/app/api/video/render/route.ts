import { bundle } from '@remotion/bundler'
import { renderMedia, selectComposition } from '@remotion/renderer'
import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

export async function POST(request: Request) {
  try {
    const { template, props, orgId } = await request.json()

    // Bundle the video
    const bundled = await bundle({
      entryPoint: path.join(process.cwd(), 'lib/video/index.tsx'),
      webpackOverride: (config) => config,
    })

    // Select composition
    const composition = await selectComposition({
      serveUrl: bundled,
      id: template, // 'AdTemplate' | 'SocialTemplate' | 'BlogSummary'
      inputProps: props,
    })

    // Render to buffer
    const outputPath = path.join('/tmp', `${orgId}-${Date.now()}.mp4`)
    await renderMedia({
      composition,
      serveUrl: bundled,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps: props,
    })

    // Upload to Supabase Storage
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const fileBuffer = fs.readFileSync(outputPath)
    const remotePath = `videos/${orgId}/${Date.now()}.mp4`
    
    const { data, error } = await supabase.storage
      .from('org-assets')
      .upload(remotePath, fileBuffer, {
        contentType: 'video/mp4',
        cacheControl: '3600'
      })

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from('org-assets')
      .getPublicUrl(data!.path)

    // Cleanup local file
    fs.unlinkSync(outputPath)

    return NextResponse.json({ video_url: publicUrl })
  } catch (err: any) {
    console.error('Video Render Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
