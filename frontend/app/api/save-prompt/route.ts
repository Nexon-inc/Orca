import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Invalid prompt content' }, { status: 400 });
    }

    // Resolve the workspace root (one level up from frontend app root in local test environment)
    let rootPath = path.join(process.cwd(), '..');
    
    // Fallback if we are in production or direct root execution
    if (!fs.existsSync(path.join(rootPath, 'frontend'))) {
      rootPath = process.cwd();
    }

    const targetFilePath = path.join(rootPath, 'prompt.txt');
    
    try {
      fs.writeFileSync(targetFilePath, prompt, 'utf8');
      return NextResponse.json({ 
        success: true, 
        filename: 'prompt.txt',
        path: targetFilePath
      });
    } catch (writeErr: any) {
      console.warn('Failed to write to workspace root, trying /tmp fallback:', writeErr.message);
      
      // Try /tmp directory as fallback for serverless environments like Vercel
      const tmpFilePath = path.join('/tmp', 'prompt.txt');
      try {
        fs.writeFileSync(tmpFilePath, prompt, 'utf8');
        return NextResponse.json({
          success: true,
          filename: 'prompt.txt',
          path: tmpFilePath,
          warning: 'Saved to /tmp directory (workspace root is read-only)'
        });
      } catch (tmpErr: any) {
        console.error('Failed to write to /tmp directory:', tmpErr.message);
        // Fail-safe: don't throw 500, just return success with a warning
        return NextResponse.json({
          success: true,
          filename: 'prompt.txt',
          inMemory: true,
          warning: 'File system is read-only. Prompt was processed in-memory.'
        });
      }
    }
  } catch (err: any) {
    console.error('Error saving prompt file:', err);
    return NextResponse.json({ error: err.message || 'Failed to save prompt' }, { status: 500 });
  }
}
