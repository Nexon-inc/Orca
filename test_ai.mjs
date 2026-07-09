import { config } from 'dotenv';
import path from 'path';
config({ path: path.join(process.cwd(), 'frontend', '.env.local') });

async function testGemini() {
  console.log('[1/2] Testing Gemini API (Raw REST)...');
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ Gemini Failed: GEMINI_API_KEY is not set in .env.local');
    return;
  }

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: "Explain quantum computing in one short sentence." }] }] })
    });
    const data = await res.json();
    
    if (res.ok && data.candidates) {
      console.log('✅ Gemini Success:', data.candidates[0].content.parts[0].text.trim());
    } else {
      console.error('❌ Gemini Failed:', JSON.stringify(data));
    }
  } catch (err) {
    console.error('❌ Gemini Failed:', err.message);
  }
}

async function testGroq() {
  console.log('\n[2/2] Testing Groq API (Raw REST)...');
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error('❌ Groq Failed: GROQ_API_KEY is not set in .env.local');
    return;
  }

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: "Explain gravity in one short sentence." }]
      })
    });
    const data = await res.json();
    
    if (res.ok && data.choices) {
      console.log('✅ Groq Success:', data.choices[0].message.content.trim());
    } else {
      console.error('❌ Groq Failed:', JSON.stringify(data));
    }
  } catch (err) {
    console.error('❌ Groq Failed:', err.message);
  }
}

async function runAll() {
  console.log('--- STARTING AI CONNECTION REST TEST ---\n');
  await testGemini();
  await testGroq();
  console.log('\n--- TESTS COMPLETED ---');
}

runAll();
