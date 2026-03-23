import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'

interface AdTemplateProps {
  headline: string
  subheadline: string
  cta: string
  brandColor: string
  logoText: string
}

export const AdTemplate: React.FC<AdTemplateProps> = ({
  headline,
  subheadline,
  cta,
  brandColor = '#00FF87',
  logoText = 'ORCA'
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Headline fades in at frame 0
  const headlineOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' })

  // Subheadline slides in at frame 20
  const subOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: 'clamp' })
  const subY = interpolate(frame, [20, 40], [20, 0], { extrapolateRight: 'clamp' })

  // CTA button bounces in at frame 40
  const ctaScale = spring({ frame: frame - 40, fps, config: { stiffness: 200 } })

  return (
    <AbsoluteFill style={{ backgroundColor: '#030a06', justifyContent: 'center', alignItems: 'center', padding: 60 }}>
      {/* Brand mark */}
      <div style={{ position: 'absolute', top: 40, left: 40, color: brandColor, fontWeight: 900, fontSize: 24 }}>
        {logoText}
      </div>

      {/* Headline */}
      <h1 style={{ color: '#FFFFFF', fontSize: 64, fontWeight: 800, textAlign: 'center', opacity: headlineOpacity, margin: 0 }}>
        {headline}
      </h1>

      {/* Subheadline */}
      <p style={{ color: '#9ca3af', fontSize: 28, textAlign: 'center', opacity: subOpacity, transform: `translateY(${subY}px)`, marginTop: 24 }}>
        {subheadline}
      </p>

      {/* CTA */}
      <div style={{
        marginTop: 48,
        backgroundColor: brandColor,
        color: '#030a06',
        padding: '16px 40px',
        borderRadius: 8,
        fontWeight: 700,
        fontSize: 22,
        transform: `scale(${ctaScale})`,
      }}>
        {cta}
      </div>
    </AbsoluteFill>
  )
}
