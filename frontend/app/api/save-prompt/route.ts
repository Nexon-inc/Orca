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
    fs.writeFileSync(targetFilePath, prompt, 'utf8');

    return NextResponse.json({ 
      success: true, 
      filename: 'prompt.txt',
      path: targetFilePath
    });
  } catch (err: any) {
    console.error('Error saving prompt file:', err);
    return NextResponse.json({ error: err.message || 'Failed to save prompt' }, { status: 500 });
  }
}
