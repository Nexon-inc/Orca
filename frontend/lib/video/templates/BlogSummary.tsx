import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

interface BlogSummaryProps {
  title: string;
  points: string[];
  brandColor: string;
}

export const BlogSummary: React.FC<BlogSummaryProps> = ({
  title,
  points = [],
  brandColor = '#00FF87'
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 30], [0, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#030a06', padding: 80 }}>
      <h1 style={{ color: brandColor, fontSize: 80, fontWeight: 900, marginBottom: 60, opacity: titleOpacity }}>
        {title}
      </h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
        {points.map((point, i) => {
          const pointFrame = 60 + i * 30;
          const pointOpacity = interpolate(frame, [pointFrame, pointFrame + 20], [0, 1], { extrapolateRight: 'clamp' });
          const pointX = interpolate(frame, [pointFrame, pointFrame + 20], [-50, 0], { extrapolateRight: 'clamp' });

          return (
            <div key={i} style={{
              fontSize: 40,
              color: '#FFFFFF',
              opacity: pointOpacity,
              transform: `translateX(${pointX}px)`,
              display: 'flex',
              alignItems: 'center',
              gap: 20
            }}>
              <span style={{ color: brandColor }}>→</span> {point}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
