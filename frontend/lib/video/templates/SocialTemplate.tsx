import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

interface SocialTemplateProps {
  text: string;
  brandColor: string;
}

export const SocialTemplate: React.FC<SocialTemplateProps> = ({ text, brandColor = '#00FF87' }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 15], [0, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#030a06', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{
        padding: 40,
        border: `2px solid ${brandColor}`,
        borderRadius: 20,
        opacity,
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#FFFFFF', fontSize: 48, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {text}
        </h2>
      </div>
    </AbsoluteFill>
  );
};
