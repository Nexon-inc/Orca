import { config } from 'dotenv';
import path from 'path';
config({ path: path.join(process.cwd(), '.env.local') });

async function testGemini() {
  console.log('[1/2] Testing 最新 Gemini API (Raw REST)...');
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ Gemini Failed: GEMINI_API_KEY is not set');
    return;
  }

  // Testing the latest 2026 models derived from Google's changelog
  const modelsToTest = [
    'gemini-3-pro-preview',
    'gemini-3.1-pro-preview',
    'gemini-3.1-flash-lite-preview'
  ];

  for (const model of modelsToTest) {
    console.log(`Testing model: ${model}`);
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: "Respond 'Hello'" }] }] })
      });
      const data = await res.json();
      
      if (res.ok && data.candidates) {
        console.log(`✅ ${model} Success! Response: ${data.candidates[0].content.parts[0].text.trim()}`);
        return; // exit on first success
      } else {
        console.error(`❌ ${model} Failed: ${data.error?.message || JSON.stringify(data)}`);
      }
    } catch (err) {
      console.error(`❌ ${model} Network Fail:`, err.message);
    }
  }
}

testGemini();
