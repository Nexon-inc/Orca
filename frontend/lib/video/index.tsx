import { registerRoot } from 'remotion';
import { Composition } from 'remotion';
import { AdTemplate } from './templates/AdTemplate';
import { SocialTemplate } from './templates/SocialTemplate';
import { BlogSummary } from './templates/BlogSummary';

export const RemotionVideo: React.FC = () => {
  return (
    <>
      <Composition
        id="AdTemplate"
        component={AdTemplate}
        durationInFrames={450} // 15s * 30fps
        fps={30}
        width={1080}
        height={1080}
        defaultProps={{
          headline: 'Revolutionize Your Workflow',
          subheadline: 'Orca AI orchestrates your entire team autonomously.',
          cta: 'Start Free Trial',
          brandColor: '#00FF87',
          logoText: 'ORCA'
        }}
      />
      <Composition
        id="SocialTemplate"
        component={SocialTemplate}
        durationInFrames={300} // 10s * 30fps
        fps={30}
        width={1080}
        height={1080}
        defaultProps={{
          text: 'New update from Aria',
          brandColor: '#00FF87'
        }}
      />
      <Composition
        id="BlogSummary"
        component={BlogSummary}
        durationInFrames={900} // 30s * 30fps
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: 'The Future of AI Agents',
          points: ['Autonomous Coordination', 'Real-time Execution', 'Seamless Integration'],
          brandColor: '#00FF87'
        }}
      />
    </>
  );
};

registerRoot(RemotionVideo);
