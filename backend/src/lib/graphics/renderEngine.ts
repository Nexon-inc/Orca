import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

const execPromise = promisify(exec);

export interface RenderConfig {
  templateId: string;
  props: Record<string, any>;
  outputName: string;
}

export class RenderEngine {
  private outputDir: string;
  private geminiKey: string;

  constructor() {
    this.outputDir = path.join(process.cwd(), 'output', 'renders');
    this.geminiKey = process.env.GEMINI_API_KEY || '';
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Generates voice/music using Gemini's audio modality.
   */
  async generateAudio(text: string, voiceName: string = 'Kore'): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-002:generateContent?key=${this.geminiKey}`;
    
    const payload = {
      contents: [{ parts: [{ text }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName }
          }
        }
      }
    };

    const response = await axios.post(url, payload);
    const audioBase64 = response.data.candidates[0].content.parts[0].inlineData.data;
    const audioBuffer = Buffer.from(audioBase64, 'base64');
    
    const filePath = path.join(this.outputDir, `voice-${Date.now()}.mp3`);
    fs.writeFileSync(filePath, audioBuffer);
    
    return filePath;
  }

  /**
   * Renders a Remotion video using the CLI.
   */
  async renderVideo(config: RenderConfig): Promise<string> {
    const outputPath = path.join(this.outputDir, `${config.outputName}.mp4`);
    const propsJson = JSON.stringify(config.props);
    
    // Command: npx remotion render <entry> <template-id> <out> --props='<json>'
    const cmd = `npx remotion render src/remotion/index.tsx ${config.templateId} ${outputPath} --props='${propsJson}'`;
    
    console.log(`[RenderEngine] Starting render: ${config.templateId}`);
    try {
      await execPromise(cmd);
      return outputPath;
    } catch (error) {
      console.error('[RenderEngine] Render failed:', error);
      throw new Error('Video rendering failed');
    }
  }
}
